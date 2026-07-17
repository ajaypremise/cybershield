import { env } from "@/lib/env";
import { signShortLivedPayload, verifyShortLivedPayload } from "@/lib/crypto";

type PortalToken = { customerId: string; sessionId: string; expiresAt: number; purpose: "record" | "reuse" };

export function createPortalToken(customerId: string, sessionId: string, purpose: PortalToken["purpose"], ttlMinutes = 20) {
  const payload: PortalToken = { customerId, sessionId, purpose, expiresAt: Date.now() + ttlMinutes * 60_000 };
  return signShortLivedPayload(JSON.stringify(payload), env("SIGNING_TOKEN_SECRET"));
}

export function verifyPortalToken(token: string, sessionId: string, purpose: PortalToken["purpose"]) {
  const raw = verifyShortLivedPayload(token, env("SIGNING_TOKEN_SECRET"));
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as PortalToken;
    if (payload.sessionId !== sessionId || payload.purpose !== purpose || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch { return null; }
}

