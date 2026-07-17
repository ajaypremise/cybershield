import { NextResponse } from "next/server";
import { findAgreementByRawToken } from "@/lib/agreement/service";
import { generateAgreementPdf } from "@/lib/pdf";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const result = await findAgreementByRawToken(token);
  if (result.kind !== "valid") return NextResponse.json({ error: "Document link is invalid or expired" }, { status: 410 });
  const agreement = result.agreement; const pdf = await generateAgreementPdf({ snapshot: agreement.agreementContentSnapshot, agreementNumber: agreement.agreementNumber, version: agreement.agreementVersion });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="CyberShield-Agreement-${agreement.agreementNumber}-unsigned.pdf"`, "Cache-Control": "private, no-store" } });
}

