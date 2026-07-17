import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCompletionToken } from "@/lib/completion-token";
import { findAgreementByRawToken } from "@/lib/agreement/service";
import { claimAgreementSigning } from "@/lib/agreement/signing-claim";
import { CONSENT_TEXT } from "@/lib/agreement/content";
import { sha256 } from "@/lib/crypto";
import { sendCompletedAgreement } from "@/lib/email";
import { formatAest, formatUtc } from "@/lib/format";
import { generateAgreementPdf } from "@/lib/pdf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { storePrivateFile } from "@/lib/storage";
import { decodeSignature, signAgreementSchema, validateSignatureImage } from "@/lib/validation";
import { appBaseUrl } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""; if (!contentType.toLowerCase().startsWith("application/json")) return NextResponse.json({ error: "Unsupported request format" }, { status: 415 });
    const contentLength = Number(request.headers.get("content-length") || "0"); if (contentLength > 750_000) return NextResponse.json({ error: "Signature request is too large" }, { status: 413 });
    const origin = request.headers.get("origin"); if (origin && origin !== new URL(appBaseUrl()).origin) return NextResponse.json({ error: "Request origin is not allowed" }, { status: 403 });
    const parsed = signAgreementSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid signing request" }, { status: 400 });
    if (parsed.data.consentText !== CONSENT_TEXT) return NextResponse.json({ error: "Consent text did not match the displayed agreement" }, { status: 400 });
    const context = await requestContext(); await enforceRateLimit("agreement-sign", context.ip, 12, 60 * 60);
    const tokenResult = await findAgreementByRawToken(parsed.data.token);
    if (tokenResult.kind === "used" && tokenResult.agreement.status === "SIGNED") return NextResponse.json({ completionToken: createCompletionToken(tokenResult.agreement.id) });
    if (tokenResult.kind !== "valid") return NextResponse.json({ error: `Signing link is ${tokenResult.kind}` }, { status: 410 });
    const agreement = tokenResult.agreement; const signature = decodeSignature(parsed.data.signatureDataUrl); await validateSignatureImage(signature); const signedAt = new Date(); const typedSignerName = parsed.data.typedSignerName.trim();
    const documentHash = sha256(JSON.stringify({ agreementNumber: agreement.agreementNumber, agreementVersion: agreement.agreementVersion, snapshot: agreement.agreementContentSnapshot, typedSignerName, consentText: CONSENT_TEXT, signatureHash: sha256(signature), signedAt: signedAt.toISOString() }));
    const signatureUrl = await storePrivateFile(`agreements/${agreement.id}/signature-${documentHash}.png`, signature, "image/png");
    const pdf = await generateAgreementPdf({ snapshot: agreement.agreementContentSnapshot, agreementNumber: agreement.agreementNumber, version: agreement.agreementVersion, signed: { typedName: typedSignerName, signedAtUtc: formatUtc(signedAt), signedAtAest: formatAest(signedAt), ip: context.ip, documentHash, signatureDataUrl: parsed.data.signatureDataUrl } });
    const pdfUrl = await storePrivateFile(`agreements/${agreement.id}/signed-${documentHash}.pdf`, pdf, "application/pdf");
    const completed = await prisma.$transaction((tx) => claimAgreementSigning(tx, { agreementId: agreement.id, tokenHash: sha256(parsed.data.token), signedAt, typedSignerName, signatureFileUrl: signatureUrl, signedPdfUrl: pdfUrl, signerIp: context.ip, signerUserAgent: context.userAgent, signerConsentText: CONSENT_TEXT, documentHash }));
    if (!completed) { const replay = await prisma.agreement.findUnique({ where: { id: agreement.id }, select: { status: true } }); if (replay?.status === "SIGNED") return NextResponse.json({ completionToken: createCompletionToken(agreement.id) }); return NextResponse.json({ error: "The agreement changed before signing. Refresh and request a new link." }, { status: 409 }); }
    try {
      const messages = await sendCompletedAgreement({ customerEmail: agreement.customer.email, customerName: agreement.customer.name, agreementNumber: agreement.agreementNumber, pdf });
      await prisma.agreement.update({ where: { id: agreement.id }, data: { resendCustomerEmailId: messages.customerId, resendInternalEmailId: messages.internalId, events: { create: { eventType: "SIGNED_PDF_EMAILS_DELIVERED", metadata: messages } } } });
    } catch { await prisma.agreementEvent.create({ data: { agreementId: agreement.id, eventType: "SIGNED_PDF_EMAIL_DELIVERY_FAILED" } }); }
    return NextResponse.json({ completionToken: createCompletionToken(agreement.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "The agreement could not be completed. No sensitive details were logged; please try again or contact CyberShield." }, { status: 500 }); }
}



