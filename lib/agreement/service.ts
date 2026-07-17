import { Prisma, type AgreementStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createSigningToken, randomPublicId, sha256 } from "@/lib/crypto";
import { appBaseUrl } from "@/lib/env";
import { formatAest, formatAud } from "@/lib/format";
import { AGREEMENT_VERSION, createAgreementSnapshot } from "@/lib/agreement/content";
import { sendSigningRequest } from "@/lib/email";
import { logInternalFailure } from "@/lib/internal-log";

export async function createAgreementDraft(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId }, include: { customer: true } });
  if (!purchase) throw new Error("Purchase not found");
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const agreementNumber = `${randomPublicId("CSA-AGR", 8)}`;
    const snapshot = createAgreementSnapshot({
      agreementNumber, customerId: purchase.customer.customerId, customerName: purchase.customer.name,
      email: purchase.customer.email, tenure: purchase.tenure, amount: formatAud(purchase.amountPaid), agentName: purchase.agentName,
    });
    try {
      return await prisma.agreement.create({
        data: { customerId: purchase.customerId, purchaseId: purchase.id, agreementNumber, agreementVersion: AGREEMENT_VERSION, agreementContentSnapshot: snapshot, events: { create: { eventType: "DRAFT_CREATED" } } },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002" || attempt === 7) throw error;
    }
  }
  throw new Error("Unable to allocate an agreement number");
}

const sendable: AgreementStatus[] = ["DRAFT", "SENT", "VIEWED", "EXPIRED"];

export async function issueSigningRequest(agreementId: string, eventType: "SENT" | "RESENT") {
  const agreement = await prisma.agreement.findUnique({ where: { id: agreementId }, include: { customer: true, purchase: true } });
  if (!agreement || !sendable.includes(agreement.status)) throw new Error("Agreement cannot be sent in its current state");
  const previous = { tokenHash: agreement.tokenHash, tokenExpiresAt: agreement.tokenExpiresAt, status: agreement.status, sentAt: agreement.sentAt };
  const { token, hash } = createSigningToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await prisma.agreement.update({ where: { id: agreement.id }, data: { tokenHash: hash, tokenExpiresAt: expiresAt, tokenUsedAt: null, status: "SENT", sentAt: new Date(), events: { create: { eventType, metadata: { expiresAt: expiresAt.toISOString() } } } } });
  } catch (error) {
    logInternalFailure("agreement_invitation_prepare_database_update", error);
    throw error;
  }

  let resendEmailId: string;
  try {
    resendEmailId = await sendSigningRequest(agreement.customer.email, {
      customerName: agreement.customer.name, customerId: agreement.customer.customerId, tenure: agreement.purchase.tenure,
      amount: formatAud(agreement.purchase.amountPaid), signingUrl: `${appBaseUrl()}/sign/${token}`, expires: formatAest(expiresAt),
    });
  } catch (error) {
    try {
      await prisma.agreement.update({ where: { id: agreement.id }, data: { ...previous, events: { create: { eventType: "SIGNING_EMAIL_FAILED" } } } });
    } catch (rollbackError) {
      logInternalFailure("agreement_invitation_failure_rollback", rollbackError);
    }
    throw error;
  }

  let persistenceFailed = false;
  try {
    await prisma.agreement.update({ where: { id: agreement.id }, data: { resendCustomerEmailId: resendEmailId, events: { create: { eventType: "SIGNING_EMAIL_DELIVERED", metadata: { resendEmailId } } } } });
  } catch (error) {
    persistenceFailed = true;
    logInternalFailure("agreement_invitation_success_database_update", error);
  }
  return { resendEmailId, persistenceFailed };
}

export async function findAgreementByRawToken(token: string) {
  const agreement = await prisma.agreement.findUnique({
    where: { tokenHash: sha256(token) }, include: { customer: true, purchase: true, events: { orderBy: { timestamp: "asc" } } },
  });
  if (!agreement) return { kind: "invalid" as const };
  if (agreement.status === "VOID") return { kind: "void" as const };
  if (agreement.status === "SIGNED" || agreement.tokenUsedAt) return { kind: "used" as const, agreement };
  if (!agreement.tokenExpiresAt || agreement.tokenExpiresAt <= new Date()) {
    if (agreement.status !== "EXPIRED") await prisma.agreement.update({ where: { id: agreement.id }, data: { status: "EXPIRED", events: { create: { eventType: "TOKEN_EXPIRED" } } } });
    return { kind: "expired" as const, agreement };
  }
  if (!(["SENT", "VIEWED"] as AgreementStatus[]).includes(agreement.status)) return { kind: "invalid" as const };
  return { kind: "valid" as const, agreement };
}

export async function recordAgreementViewed(agreementId: string, ip: string, userAgent: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.agreement.updateMany({ where: { id: agreementId, viewedAt: null, status: "SENT" }, data: { viewedAt: new Date(), status: "VIEWED" } });
    if (updated.count === 1) await tx.agreementEvent.create({ data: { agreementId, eventType: "VIEWED", ipAddress: ip, userAgent } });
  });
}
