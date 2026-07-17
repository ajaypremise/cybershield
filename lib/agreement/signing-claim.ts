export type SigningClaimInput = {
  agreementId: string; tokenHash: string; signedAt: Date; typedSignerName: string; signatureFileUrl: string; signedPdfUrl: string;
  signerIp: string; signerUserAgent: string; signerConsentText: string; documentHash: string;
};

export interface SigningClaimTransaction {
  agreement: { updateMany(args: unknown): Promise<{ count: number }> };
  agreementEvent: { create(args: unknown): Promise<unknown> };
}

export async function claimAgreementSigning(tx: SigningClaimTransaction, input: SigningClaimInput): Promise<boolean> {
  const update = await tx.agreement.updateMany({ where: { id: input.agreementId, tokenHash: input.tokenHash, tokenUsedAt: null, tokenExpiresAt: { gt: input.signedAt }, status: { in: ["SENT", "VIEWED"] } }, data: { status: "SIGNED", tokenUsedAt: input.signedAt, signedAt: input.signedAt, typedSignerName: input.typedSignerName, signatureFileUrl: input.signatureFileUrl, signedPdfUrl: input.signedPdfUrl, signerIp: input.signerIp, signerUserAgent: input.signerUserAgent, signerConsentText: input.signerConsentText, documentHash: input.documentHash } });
  if (update.count !== 1) return false;
  await tx.agreementEvent.create({ data: { agreementId: input.agreementId, eventType: "SIGNED", timestamp: input.signedAt, ipAddress: input.signerIp, userAgent: input.signerUserAgent, metadata: { documentHash: input.documentHash } } });
  return true;
}

