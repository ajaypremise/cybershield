"use server";

import { redirect } from "next/navigation";
import { validateCsrf } from "@/lib/auth";
import { adminAudit } from "@/lib/audit";
import { createAgreementDraft, issueSigningRequest } from "@/lib/agreement/service";
import { prisma } from "@/lib/db";
import { EmailDeliveryError } from "@/lib/email";
import { logInternalFailure } from "@/lib/internal-log";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { agreementActionSchema, agreementCreateSchema } from "@/lib/validation";

export async function createAgreementAction(formData: FormData) {
  const parsed = agreementCreateSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) redirect("/agreement?error=Invalid%20purchase");
  await validateCsrf(parsed.data.csrfToken); const context = await requestContext(); await enforceRateLimit("agreement-create", context.ip, 20, 60 * 60);
  const agreement = await createAgreementDraft(parsed.data.purchaseId); await adminAudit("AGREEMENT_DRAFT_CREATED", agreement.id, context.ip); redirect(`/agreement?agreement=${agreement.id}&created=1`);
}

async function parseAgreementAction(formData: FormData) {
  const parsed = agreementActionSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) redirect("/agreement?error=Invalid%20request"); await validateCsrf(parsed.data.csrfToken); return parsed.data;
}

async function auditSuccessfulInvitation(action: string, agreementId: string, ip: string) {
  try {
    await adminAudit(action, agreementId, ip);
  } catch (error) {
    logInternalFailure("agreement_invitation_success_audit", error);
  }
}

export async function sendAgreementAction(formData: FormData) {
  const data = await parseAgreementAction(formData); const context = await requestContext(); await enforceRateLimit("agreement-send", context.ip, 15, 60 * 60);
  try {
    await issueSigningRequest(data.agreementId, "SENT");
  } catch (error) {
    if (!(error instanceof EmailDeliveryError)) logInternalFailure("agreement_invitation_pre_send_operation", error);
    const message = error instanceof EmailDeliveryError
      ? "Resend did not accept the signing email. The previous link remains unchanged."
      : "The signing request could not be prepared. No delivery failure was recorded.";
    redirect(`/agreement?agreement=${data.agreementId}&error=${encodeURIComponent(message)}`);
  }
  await auditSuccessfulInvitation("AGREEMENT_SENT", data.agreementId, context.ip);
  redirect(`/agreement?agreement=${data.agreementId}&sent=1`);
}

export async function resendAgreementAction(formData: FormData) {
  const data = await parseAgreementAction(formData); const context = await requestContext(); await enforceRateLimit("agreement-resend", context.ip, 10, 60 * 60);
  try {
    await issueSigningRequest(data.agreementId, "RESENT");
  } catch (error) {
    if (!(error instanceof EmailDeliveryError)) logInternalFailure("agreement_invitation_resend_pre_send_operation", error);
    const message = error instanceof EmailDeliveryError
      ? "Resend did not accept the replacement signing email."
      : "The replacement signing request could not be prepared. No delivery failure was recorded.";
    redirect(`/agreement?agreement=${data.agreementId}&error=${encodeURIComponent(message)}`);
  }
  await auditSuccessfulInvitation("AGREEMENT_RESENT", data.agreementId, context.ip);
  redirect(`/agreement?agreement=${data.agreementId}&resent=1`);
}

export async function voidAgreementAction(formData: FormData) {
  const data = await parseAgreementAction(formData); const context = await requestContext();
  const changed = await prisma.agreement.updateMany({ where: { id: data.agreementId, status: { not: "SIGNED" } }, data: { status: "VOID", tokenHash: null, tokenExpiresAt: null } });
  if (changed.count !== 1) redirect(`/agreement?agreement=${data.agreementId}&error=Signed%20agreements%20cannot%20be%20voided`);
  await prisma.agreementEvent.create({ data: { agreementId: data.agreementId, eventType: "VOIDED", ipAddress: context.ip, userAgent: context.userAgent } }); await adminAudit("AGREEMENT_VOIDED", data.agreementId, context.ip); redirect(`/agreement?agreement=${data.agreementId}&voided=1`);
}
