"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { validateCsrf } from "@/lib/auth";
import { adminAudit } from "@/lib/audit";
import { upsertCustomer } from "@/lib/customer";
import { prisma } from "@/lib/db";
import { sendPurchaseConfirmation } from "@/lib/email";
import { formatAest, formatAud } from "@/lib/format";
import { logInternalFailure } from "@/lib/internal-log";
import { generateContactInformationPdf } from "@/lib/pdf";
import { createPurchaseOnce } from "@/lib/purchase";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { agreementActionSchema, purchaseInputSchema } from "@/lib/validation";

async function recordInitialDeliveryFailure(purchaseId: string, ip: string, auditAction: string) {
  try {
    await prisma.purchase.update({ where: { id: purchaseId }, data: { status: "DELIVERY_FAILED" } });
  } catch (error) {
    logInternalFailure("purchase_confirmation_failure_status_update", error);
  }
  try {
    await adminAudit(auditAction, purchaseId, ip);
  } catch (error) {
    logInternalFailure("purchase_confirmation_failure_audit", error);
  }
}

async function auditAttempt(action: string, purchaseId: string, ip: string, metadata?: Prisma.InputJsonValue) {
  try {
    await adminAudit(action, purchaseId, ip, metadata);
  } catch (error) {
    logInternalFailure("purchase_confirmation_audit", error);
  }
}

async function saveSuccessfulDelivery(input: { purchaseId: string; sentAt: Date; emailId: string }): Promise<void> {
  try {
    await prisma.purchase.update({
      where: { id: input.purchaseId },
      data: { status: "SENT", confirmationSentAt: input.sentAt, resendEmailId: input.emailId },
    });
  } catch (error) {
    logInternalFailure("purchase_confirmation_success_database_update", error);
  }
}

export async function sendPurchaseConfirmationAction(formData: FormData) {
  const parsed = purchaseInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/email?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid form")}`);
  await validateCsrf(parsed.data.csrfToken);
  const context = await requestContext();
  await enforceRateLimit("purchase-send", context.ip, 15, 60 * 60);
  const customer = await upsertCustomer({ name: parsed.data.customerName, email: parsed.data.customerEmail });
  const creation = await createPurchaseOnce({
    findBySubmissionKey: () => prisma.purchase.findUnique({ where: { submissionKey: parsed.data.submissionKey } }),
    create: () => prisma.purchase.create({ data: { customerId: customer.id, tenure: parsed.data.tenure, amountPaid: new Prisma.Decimal(parsed.data.amountPaid), agentName: parsed.data.agentName, submissionKey: parsed.data.submissionKey } }),
  });
  const purchase = creation.record;
  if (!creation.created) redirect(`/email?sent=${purchase.id}`);

  let contactPdf: Buffer;
  try {
    contactPdf = await generateContactInformationPdf();
  } catch (error) {
    logInternalFailure("purchase_confirmation_pdf_generation", error);
    await recordInitialDeliveryFailure(purchase.id, context.ip, "PURCHASE_CONFIRMATION_PDF_FAILED");
    redirect(`/email?error=${encodeURIComponent("The confirmation was saved, but its PDF could not be generated. No email was sent.")}`);
  }

  const sentAt = new Date();
  let emailId: string;
  try {
    emailId = await sendPurchaseConfirmation(customer.email, {
      customerName: customer.name,
      customerId: customer.customerId,
      tenure: purchase.tenure,
      amount: formatAud(purchase.amountPaid),
      agentName: purchase.agentName,
      confirmationDate: formatAest(sentAt),
    }, contactPdf);
  } catch {
    await recordInitialDeliveryFailure(purchase.id, context.ip, "PURCHASE_CONFIRMATION_EMAIL_FAILED");
    redirect(`/email?error=${encodeURIComponent("The confirmation was saved but Resend did not accept the email. You can resend it deliberately from history.")}`);
  }

  await saveSuccessfulDelivery({ purchaseId: purchase.id, sentAt, emailId });
  await auditAttempt("PURCHASE_CONFIRMATION_SENT", purchase.id, context.ip, { customerId: customer.customerId, resendEmailId: emailId });
  redirect(`/email?sent=${purchase.id}`);
}

export async function resendPurchaseConfirmationAction(formData: FormData) {
  const parsed = agreementActionSchema.safeParse({ agreementId: formData.get("purchaseId"), csrfToken: formData.get("csrfToken") });
  if (!parsed.success) redirect("/email?error=Invalid%20request");
  await validateCsrf(parsed.data.csrfToken);
  const context = await requestContext();
  await enforceRateLimit("purchase-resend", context.ip, 10, 60 * 60);
  const purchase = await prisma.purchase.findUnique({ where: { id: parsed.data.agreementId }, include: { customer: true } });
  if (!purchase) redirect("/email?error=Confirmation%20not%20found");

  let contactPdf: Buffer;
  try {
    contactPdf = await generateContactInformationPdf();
  } catch (error) {
    logInternalFailure("purchase_confirmation_resend_pdf_generation", error);
    await auditAttempt("PURCHASE_CONFIRMATION_RESEND_PDF_FAILED", purchase.id, context.ip);
    redirect(`/email?error=${encodeURIComponent("The confirmation PDF could not be generated. No resend was attempted.")}`);
  }

  const sentAt = new Date();
  let emailId: string;
  try {
    emailId = await sendPurchaseConfirmation(purchase.customer.email, {
      customerName: purchase.customer.name,
      customerId: purchase.customer.customerId,
      tenure: purchase.tenure,
      amount: formatAud(purchase.amountPaid),
      agentName: purchase.agentName,
      confirmationDate: formatAest(sentAt),
    }, contactPdf);
  } catch {
    await auditAttempt("PURCHASE_CONFIRMATION_RESEND_EMAIL_FAILED", purchase.id, context.ip);
    redirect(`/email?error=${encodeURIComponent("Resend did not accept the email. No duplicate confirmation was recorded.")}`);
  }

  await saveSuccessfulDelivery({ purchaseId: purchase.id, sentAt, emailId });
  await auditAttempt("PURCHASE_CONFIRMATION_RESENT", purchase.id, context.ip, { resendEmailId: emailId });
  redirect(`/email?sent=${purchase.id}&resent=1`);
}
