import { env } from "@/lib/env";
import { signShortLivedPayload, verifyShortLivedPayload } from "@/lib/crypto";

export function createCompletionToken(agreementId: string): string {
  return signShortLivedPayload(JSON.stringify({ agreementId, expiresAt: Date.now() + 15 * 60 * 1000 }), env("SIGNING_TOKEN_SECRET"));
}

export function verifyCompletionToken(token: string): string | null {
  const decoded = verifyShortLivedPayload(token, env("SIGNING_TOKEN_SECRET"));
  if (!decoded) return null;
  try { const value = JSON.parse(decoded) as { agreementId?: string; expiresAt?: number }; return value.agreementId && value.expiresAt && value.expiresAt > Date.now() ? value.agreementId : null; }
  catch { return null; }
}

