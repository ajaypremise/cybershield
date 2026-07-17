import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const PUBLIC_ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomPublicId(prefix = "CSA", length = 6): string {
  const bytes = randomBytes(length);
  let body = "";
  for (let index = 0; index < length; index += 1) {
    body += PUBLIC_ID_ALPHABET[bytes[index] % PUBLIC_ID_ALPHABET.length];
  }
  return `${prefix}-${body}`;
}

export function createSigningToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: sha256(token) };
}

export function safeSecretEqual(candidate: string, expected: string): boolean {
  const candidateHash = Buffer.from(sha256(candidate), "hex");
  const expectedHash = Buffer.from(sha256(expected), "hex");
  return timingSafeEqual(candidateHash, expectedHash);
}

export function signShortLivedPayload(payload: string, secret: string): string {
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyShortLivedPayload(token: string, secret: string): string | null {
  const [encoded, supplied] = token.split(".");
  if (!encoded || !supplied) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return Buffer.from(encoded, "base64url").toString("utf8");
}

