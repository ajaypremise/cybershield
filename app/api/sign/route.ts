import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCompletionToken } from "@/lib/completion-token";
import { findAgreementByRawToken } from "@/lib/agreement/service";
import { claimAgreementSigning } from "@/lib/agreement/signing-claim";
import { CONSENT_TEXT } from "@/lib/agreement/content";
import { sha256 } from "@/lib/crypto";
import { CompletedAgreementDeliveryError, sendCompletedAgreement } from "@/lib/email";
import { formatAest, formatUtc } from "@/lib/format";
import { logInternalFailure } from "@/lib/internal-log";
import { generateAgreementPdf } from "@/lib/pdf";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { storePrivateFile } from "@/lib/storage";
import { decodeSignature, signAgreementSchema, validateSignatureImage } from "@/lib/validation";
import { appBaseUrl } from "@/lib/env";

function completionResponse(agreementId: string) {
  return NextResponse.json({ completionToken: createCompletionToken(agreementId) }, { headers: { "Cache-Control": "no-store" } });
}

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

    let signatureUrl: string;
    try {
      signatureUrl = await storePrivateFile(`agreements/${agreement.id}/signature-${documentHash}.png`, signature, "image/png");
    } catch (error) {
      logInternalFailure("agreement_signature_blob_upload", error);
      return NextResponse.json({ error: "The signature could not be stored. Please try again." }, { status: 500 });
    }

    let pdf: Buffer;
    try {
      pdf = await generateAgreementPdf({ snapshot: agreement.agreementContentSnapshot, agreementNumber: agreement.agreementNumber, version: agreement.agreementVersion, signed: { typedName: typedSignerName, signedAtUtc: formatUtc(signedAt), signedAtAest: formatAest(signedAt), ip: context.ip, documentHash, signatureDataUrl: parsed.data.signatureDataUrl } });
    } catch (error) {
      logInternalFailure("signed_agreement_pdf_generation", error);
      return NextResponse.json({ error: "The signed agreement PDF could not be generated. Please try again." }, { status: 500 });
    }

    let pdfUrl: string;
    try {
      pdfUrl = await storePrivateFile(`agreements/${agreement.id}/signed-${documentHash}.pdf`, pdf, "application/pdf");
    } catch (error) {
      logInternalFailure("signed_agreement_pdf_blob_upload", error);
      return NextResponse.json({ error: "The signed agreement PDF could not be stored. Please try again." }, { status: 500 });
    }

    let completed: boolean;
    try {
      completed = await prisma.$transaction((tx) => claimAgreementSigning(tx, { agreementId: agreement.id, tokenHash: sha256(parsed.data.token), signedAt, typedSignerName, signatureFileUrl: signatureUrl, signedPdfUrl: pdfUrl, signerIp: context.ip, signerUserAgent: context.userAgent, signerConsentText: CONSENT_TEXT, documentHash }));
    } catch (error) {
      logInternalFailure("signed_agreement_database_transaction", error);
      return NextResponse.json({ error: "The agreement could not be recorded. Please try again." }, { status: 500 });
    }
    if (!completed) { const replay = await prisma.agreement.findUnique({ where: { id: agreement.id }, select: { status: true } }); if (replay?.status === "SIGNED") return completionResponse(agreement.id); return NextResponse.json({ error: "The agreement changed before signing. Refresh and request a new link." }, { status: 409 }); }

    let messages: { customerId: string; internalId: string };
    try {
      messages = await sendCompletedAgreement({ customerEmail: agreement.customer.email, customerName: agreement.customer.name, agreementNumber: agreement.agreementNumber, pdf });
    } catch (error) {
      const partial = error instanceof CompletedAgreementDeliveryError ? error : null;
      try {
        await prisma.agreement.update({
          where: { id: agreement.id },
          data: {
            resendCustomerEmailId: partial?.customerId || undefined,
            resendInternalEmailId: partial?.internalId || undefined,
            events: { create: { eventType: "SIGNED_PDF_EMAIL_DELIVERY_FAILED", metadata: { customerSent: Boolean(partial?.customerId), internalSent: Boolean(partial?.internalId) } } },
          },
        });
      } catch (databaseError) {
        logInternalFailure("signed_agreement_email_failure_database_update", databaseError);
      }
      return completionResponse(agreement.id);
    }

    try {
      await prisma.agreement.update({ where: { id: agreement.id }, data: { resendCustomerEmailId: messages.customerId, resendInternalEmailId: messages.internalId, events: { create: { eventType: "SIGNED_PDF_EMAILS_DELIVERED", metadata: messages } } } });
    } catch (error) {
      logInternalFailure("signed_agreement_email_success_database_update", error);
    }
    return completionResponse(agreement.id);
  } catch (error) {
    logInternalFailure("agreement_sign_unexpected", error);
    return NextResponse.json({ error: "The agreement could not be completed. Please try again or contact CyberShield." }, { status: 500 });
  }
}
