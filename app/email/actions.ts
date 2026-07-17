"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { validateCsrf } from "@/lib/auth";
import { adminAudit } from "@/lib/audit";
import { upsertCustomer } from "@/lib/customer";
import { prisma } from "@/lib/db";
import { sendPurchaseConfirmation } from "@/lib/email";
import { formatAest, formatAud } from "@/lib/format";
import { generateContactInformationPdf } from "@/lib/pdf";
import { createPurchaseOnce } from "@/lib/purchase";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { agreementActionSchema, purchaseInputSchema } from "@/lib/validation";

export async function sendPurchaseConfirmationAction(formData: FormData) {
  const parsed = purchaseInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/email?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid form")}`);
  await validateCsrf(parsed.data.csrfToken); const context = await requestContext(); await enforceRateLimit("purchase-send", context.ip, 15, 60 * 60);
  const customer = await upsertCustomer({ name: parsed.data.customerName, email: parsed.data.customerEmail });
  const creation = await createPurchaseOnce({
    findBySubmissionKey: () => prisma.purchase.findUnique({ where: { submissionKey: parsed.data.submissionKey } }),
    create: () => prisma.purchase.create({ data: { customerId: customer.id, tenure: parsed.data.tenure, amountPaid: new Prisma.Decimal(parsed.data.amountPaid), agentName: parsed.data.agentName, submissionKey: parsed.data.submissionKey } }),
  });
  const purchase = creation.record;
  if (!creation.created) redirect(`/email?sent=${purchase.id}`);
  let deliveryFailed = false;
  try {
    const sentAt = new Date();
    const emailId = await sendPurchaseConfirmation(customer.email, { customerName: customer.name, customerId: customer.customerId, tenure: purchase.tenure, amount: formatAud(purchase.amountPaid), agentName: purchase.agentName, confirmationDate: formatAest(sentAt) }, await generateContactInformationPdf());
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "SENT", confirmationSentAt: sentAt, resendEmailId: emailId } });
    await adminAudit("PURCHASE_CONFIRMATION_SENT", purchase.id, context.ip, { customerId: customer.customerId, resendEmailId: emailId });
  } catch {
    deliveryFailed = true; await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "DELIVERY_FAILED" } }); await adminAudit("PURCHASE_CONFIRMATION_FAILED", purchase.id, context.ip);
  }
  if (deliveryFailed) redirect(`/email?error=${encodeURIComponent("The confirmation was saved but email delivery failed. You can resend it deliberately from history.")}`);
  redirect(`/email?sent=${purchase.id}`);
}

export async function resendPurchaseConfirmationAction(formData: FormData) {
  const parsed = agreementActionSchema.safeParse({ agreementId: formData.get("purchaseId"), csrfToken: formData.get("csrfToken") });
  if (!parsed.success) redirect("/email?error=Invalid%20request");
  await validateCsrf(parsed.data.csrfToken); const context = await requestContext(); await enforceRateLimit("purchase-resend", context.ip, 10, 60 * 60);
  const purchase = await prisma.purchase.findUnique({ where: { id: parsed.data.agreementId }, include: { customer: true } });
  if (!purchase) redirect("/email?error=Confirmation%20not%20found");
  let failed = false;
  try {
    const sentAt = new Date(); const emailId = await sendPurchaseConfirmation(purchase.customer.email, { customerName: purchase.customer.name, customerId: purchase.customer.customerId, tenure: purchase.tenure, amount: formatAud(purchase.amountPaid), agentName: purchase.agentName, confirmationDate: formatAest(sentAt) }, await generateContactInformationPdf());
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "SENT", confirmationSentAt: sentAt, resendEmailId: emailId } }); await adminAudit("PURCHASE_CONFIRMATION_RESENT", purchase.id, context.ip, { resendEmailId: emailId });
  } catch { failed = true; }
  if (failed) redirect(`/email?error=${encodeURIComponent("Resend failed. No duplicate confirmation was recorded.")}`);
  redirect(`/email?sent=${purchase.id}&resent=1`);
}

