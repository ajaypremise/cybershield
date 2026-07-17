import { env } from "@/lib/env";
import { signShortLivedPayload, verifyShortLivedPayload } from "@/lib/crypto";

export function createDownloadToken(agreementId: string, lifetimeSeconds = 300): string {
  return signShortLivedPayload(JSON.stringify({ agreementId, expiresAt: Date.now() + lifetimeSeconds * 1000 }), env("SIGNING_TOKEN_SECRET"));
}

export function verifyDownloadToken(token: string, agreementId: string): boolean {
  const decoded = verifyShortLivedPayload(token, env("SIGNING_TOKEN_SECRET"));
  if (!decoded) return false;
  try { const payload = JSON.parse(decoded) as { agreementId?: string; expiresAt?: number }; return payload.agreementId === agreementId && typeof payload.expiresAt === "number" && payload.expiresAt > Date.now(); }
  catch { return false; }
}

