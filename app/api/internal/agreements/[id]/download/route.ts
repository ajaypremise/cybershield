import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyDownloadToken } from "@/lib/download-token";
import { readPrivateFile } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await params; const token = new URL(request.url).searchParams.get("token") || "";
  if (!verifyDownloadToken(token, id)) return NextResponse.json({ error: "Download link expired" }, { status: 403 });
  const agreement = await prisma.agreement.findUnique({ where: { id }, select: { agreementNumber: true, status: true, signedPdfUrl: true } });
  if (!agreement?.signedPdfUrl || agreement.status !== "SIGNED") return NextResponse.json({ error: "Document unavailable" }, { status: 404 });
  const pdf = await readPrivateFile(agreement.signedPdfUrl);
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="CyberShield-Agreement-${agreement.agreementNumber}.pdf"`, "Cache-Control": "private, no-store" } });
}

