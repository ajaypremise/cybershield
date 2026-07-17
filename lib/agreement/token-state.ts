export type TokenStateRecord = { status: string; tokenExpiresAt: Date | null; tokenUsedAt: Date | null };
export type TokenState = "valid" | "expired" | "used" | "void" | "invalid";

export function classifyTokenState(record: TokenStateRecord | null, now = new Date()): TokenState {
  if (!record) return "invalid";
  if (record.status === "VOID") return "void";
  if (record.status === "SIGNED" || record.tokenUsedAt) return "used";
  if (!record.tokenExpiresAt || record.tokenExpiresAt <= now || record.status === "EXPIRED") return "expired";
  return record.status === "SENT" || record.status === "VIEWED" ? "valid" : "invalid";
}

