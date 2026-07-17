"use server";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAgent, validateAgentCsrf } from "@/lib/auth";
import { auditEvent } from "@/lib/audit";
import { createAgreementDraft, issueSigningRequest } from "@/lib/agreement/service";
import { createCustomer, findExactCustomerMatch, updateMatchedCustomer } from "@/lib/customer";
import { prisma } from "@/lib/db";
import { EmailDeliveryError, sendPurchaseConfirmation } from "@/lib/email";
import { maskEmail, maskName, isExactCustomerLookup } from "@/lib/masking";
import { generateCustomerConfirmationPdf } from "@/lib/pdf";
import { createPortalToken, verifyPortalToken } from "@/lib/portal-token";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { exactLookupSchema, normalizeEmail, noteSchema, portalConfirmationSchema, portalRecordActionSchema } from "@/lib/validation";
import { logInternalFailure } from "@/lib/internal-log";

function go(message: string, kind: "success" | "error" = "success", extra = ""): never { redirect(`/portal?${kind}=${encodeURIComponent(message)}${extra}`); }
async function agentContext(csrf: string) { const session = await validateAgentCsrf(csrf); const request = await requestContext(); return { session, request }; }

export async function exactLookupAction(formData: FormData) {
  const parsed = exactLookupSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) go("Enter an exact customer ID or email.", "error");
  const { session, request } = await agentContext(parsed.data.csrfToken); await enforceRateLimit("agent-exact-lookup", `${session.id}:${request.ip}`, 30, 15 * 60);
  const query = parsed.data.query.trim(); if (!isExactCustomerLookup(query)) go("Enter an exact customer ID or email.", "error");
  const customer = await prisma.customer.findFirst({ where: query.includes("@") ? { normalizedEmail: normalizeEmail(query) } : { customerId: query.toUpperCase() } });
  await auditEvent({ action: "AGENT_EXACT_LOOKUP", targetId: customer?.id, actorRole: "AGENT", ipAddress: request.ip, success: Boolean(customer), metadata: { lookupType: query.includes("@") ? "email" : "customer_id" } });
  if (!customer) go("No matching customer was found.", "error");
  const token = createPortalToken(customer.id, session.id, "record"); redirect(`/portal?record=${encodeURIComponent(token)}`);
}

export async function createConfirmationAction(formData: FormData) {
  const parsed = portalConfirmationSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) go(parsed.error.issues[0]?.message || "Invalid confirmation details", "error");
  const { session, request } = await agentContext(parsed.data.csrfToken); await enforceRateLimit("agent-confirmation", `${session.id}:${request.ip}`, 20, 60 * 60);
  const data = parsed.data; let customer = await findExactCustomerMatch(data.email, data.phone);
  if (customer) {
    const approved = data.reuseToken ? verifyPortalToken(data.reuseToken, session.id, "reuse") : null;
    if (!approved || approved.customerId !== customer.id) {
      const reuse = createPortalToken(customer.id, session.id, "reuse");
      redirect(`/portal?match=${encodeURIComponent(reuse)}&matchName=${encodeURIComponent(maskName(customer.firstName, customer.lastName))}&matchEmail=${encodeURIComponent(maskEmail(customer.email))}`);
    }
    customer = await updateMatchedCustomer(customer.id, data);
  } else customer = await createCustomer(data);

  const existing = await prisma.purchase.findUnique({ where: { submissionKey: data.submissionKey } });
  if (existing) go("This confirmation was already saved.", "success");
  const purchase = await prisma.purchase.create({ data: {
    customerId: customer.id, tenure: "CyberShield service coverage", salesAmount: new Prisma.Decimal(data.salesAmount), currency: data.currency,
    saleDate: new Date(`${data.saleDate}T00:00:00.000Z`), agentName: data.agentName, createdByAgentName: data.agentName,
    lastActionAgentName: data.agentName, primaryIssue: data.primaryIssue, serviceDetails: data.serviceDetails, submissionKey: data.submissionKey,
  } });
  if (data.internalNotes) await prisma.internalNote.create({ data: { customerId: customer.id, noteText: data.internalNotes, agentName: data.agentName, source: "AGENT" } });
  const send = await prisma.confirmationSend.create({ data: { customerId: customer.id, purchaseId: purchase.id, sendType: "INITIAL", idempotencyKey: data.idempotencyKey, attemptedByAgentName: data.agentName } });
  const pdfProps = { firstName: customer.firstName, lastName: customer.lastName, customerId: customer.customerId, address: customer.address, coverageDate: data.saleDate };
  let pdf: Buffer;
  try { pdf = await generateCustomerConfirmationPdf(pdfProps); }
  catch (error) { logInternalFailure("confirmation_pdf_generation", error); await prisma.confirmationSend.update({ where: { id: send.id }, data: { status: "FAILED", providerErrorName: "PdfGenerationError", providerErrorMessage: "PDF generation failed", completedAt: new Date() } }); go("The record was saved, but the confirmation PDF could not be generated. No email was sent.", "error"); }
  let emailId: string;
  try { emailId = await sendPurchaseConfirmation(customer.email, pdfProps, pdf); }
  catch (error) { const failure = error instanceof EmailDeliveryError ? error : new Error("Email delivery failed"); await prisma.confirmationSend.update({ where: { id: send.id }, data: { status: "FAILED", providerErrorName: failure.name, providerErrorMessage: failure.message, providerErrorStatusCode: failure instanceof EmailDeliveryError ? failure.statusCode : undefined, completedAt: new Date() } }); await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "DELIVERY_FAILED" } }); go("The confirmation was saved, but the email provider did not accept the email.", "error"); }
  try { await prisma.$transaction([prisma.confirmationSend.update({ where: { id: send.id }, data: { status: "SENT", resendEmailId: emailId, completedAt: new Date() } }), prisma.purchase.update({ where: { id: purchase.id }, data: { status: "SENT", confirmationSentAt: new Date(), resendEmailId: emailId } }), prisma.customer.update({ where: { id: customer.id }, data: { lastActionAgentName: data.agentName } })]); }
  catch (error) { logInternalFailure("confirmation_success_database_update", error); go("The email was sent, but its delivery history could not be fully updated.", "success"); }
  await auditEvent({ action: "CONFIRMATION_SENT", targetId: purchase.id, actorRole: "AGENT", actorName: data.agentName, ipAddress: request.ip, metadata: { resendEmailId: emailId } });
  go(`Confirmation sent for ${customer.customerId}.`);
}

export async function resendConfirmationAction(formData: FormData) {
  const parsed = portalRecordActionSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) go("Invalid request", "error");
  const { session, request } = await agentContext(parsed.data.csrfToken); const token = verifyPortalToken(parsed.data.recordToken, session.id, "record"); if (!token) go("The selected record has expired. Look it up again.", "error");
  await enforceRateLimit("agent-confirmation-resend", `${session.id}:${request.ip}`, 15, 60 * 60);
  const customer = await prisma.customer.findUnique({ where: { id: token.customerId }, include: { purchases: { orderBy: { createdAt: "desc" }, take: 1 } } }); const purchase = customer?.purchases[0]; if (!customer || !purchase) go("No confirmation is available.", "error");
  const duplicate = await prisma.confirmationSend.findFirst({ where: { purchaseId: purchase.id, createdAt: { gt: new Date(Date.now() - 30_000) } } }); if (duplicate) go("A send was already attempted recently. Wait before trying again.", "error");
  const send = await prisma.confirmationSend.create({ data: { customerId: customer.id, purchaseId: purchase.id, sendType: "RESEND", idempotencyKey: parsed.data.idempotencyKey, attemptedByAgentName: parsed.data.agentName } });
  const props = { firstName: customer.firstName, lastName: customer.lastName, customerId: customer.customerId, address: customer.address, coverageDate: purchase.saleDate.toISOString().slice(0, 10) };
  let pdf: Buffer; try { pdf = await generateCustomerConfirmationPdf(props); } catch (error) { logInternalFailure("confirmation_resend_pdf", error); await prisma.confirmationSend.update({ where: { id: send.id }, data: { status: "FAILED", providerErrorName: "PdfGenerationError", providerErrorMessage: "PDF generation failed", completedAt: new Date() } }); go("The PDF could not be generated. No email was sent.", "error"); }
  let emailId: string; try { emailId = await sendPurchaseConfirmation(customer.email, props, pdf); } catch (error) { const failure = error instanceof Error ? error : new Error("Email failed"); await prisma.confirmationSend.update({ where: { id: send.id }, data: { status: "FAILED", providerErrorName: failure.name, providerErrorMessage: failure.message, providerErrorStatusCode: error instanceof EmailDeliveryError ? error.statusCode : undefined, completedAt: new Date() } }); go("The email provider did not accept the resend.", "error"); }
  try { await prisma.confirmationSend.update({ where: { id: send.id }, data: { status: "SENT", resendEmailId: emailId, completedAt: new Date() } }); } catch (error) { logInternalFailure("confirmation_resend_success_update", error); go("The email was sent, but its history could not be updated.", "success"); }
  go("Confirmation email sent.");
}

export async function sendAgreementAction(formData: FormData) {
  const parsed = portalRecordActionSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) go("Invalid request", "error");
  const { session } = await agentContext(parsed.data.csrfToken); const token = verifyPortalToken(parsed.data.recordToken, session.id, "record"); if (!token) go("The selected record has expired.", "error");
  const purchase = await prisma.purchase.findFirst({ where: { customerId: token.customerId }, orderBy: { createdAt: "desc" } }); if (!purchase) go("No purchase is available for an agreement.", "error");
  let agreement = await prisma.agreement.findFirst({ where: { purchaseId: purchase.id, status: { not: "VOID" } }, orderBy: { createdAt: "desc" } }); if (!agreement) agreement = await createAgreementDraft(purchase.id, parsed.data.agentName);
  const duplicate = await prisma.agreementSend.findFirst({ where: { agreementId: agreement.id, createdAt: { gt: new Date(Date.now() - 30_000) } } }); if (duplicate) go("An agreement email was already attempted recently.", "error");
  const send = await prisma.agreementSend.create({ data: { customerId: token.customerId, agreementId: agreement.id, sendType: agreement.sentAt ? "RESEND" : "INITIAL", idempotencyKey: parsed.data.idempotencyKey, attemptedByAgentName: parsed.data.agentName } });
  try { const result = await issueSigningRequest(agreement.id, agreement.sentAt ? "RESENT" : "SENT", parsed.data.agentName); await prisma.agreementSend.update({ where: { id: send.id }, data: { status: "SENT", resendEmailId: result.resendEmailId, completedAt: new Date() } }); go("Agreement invitation sent."); }
  catch (error) { const failure = error instanceof Error ? error : new Error("Email failed"); await prisma.agreementSend.update({ where: { id: send.id }, data: { status: "FAILED", providerErrorName: failure.name, providerErrorMessage: failure.message, providerErrorStatusCode: error instanceof EmailDeliveryError ? error.statusCode : undefined, completedAt: new Date() } }); go("The agreement invitation could not be sent.", "error"); }
}

export async function addAgentNoteAction(formData: FormData) {
  const parsed = noteSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success || !parsed.data.recordToken) go("Invalid note", "error"); const session = await validateAgentCsrf(parsed.data.csrfToken); const token = verifyPortalToken(parsed.data.recordToken, session.id, "record"); if (!token) go("The selected record has expired.", "error");
  await prisma.internalNote.create({ data: { customerId: token.customerId, noteText: parsed.data.noteText, agentName: parsed.data.agentName, source: "AGENT" } }); go("Internal note added.");
}

export async function portalLogoutAction() { await requireAgent(); const { agentLogoutAction } = await import("@/app/portal/login/actions"); return agentLogoutAction(); }
