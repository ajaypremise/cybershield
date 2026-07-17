import { describe, expect, it } from "vitest";
import { createSigningToken, sha256 } from "@/lib/crypto";
import { classifyTokenState } from "@/lib/agreement/token-state";

describe("signing tokens", () => {
  it("creates a 32-byte token and stores only its SHA-256 hash", () => { const pair = createSigningToken(); expect(Buffer.from(pair.token, "base64url")).toHaveLength(32); expect(pair.hash).toBe(sha256(pair.token)); expect(pair.hash).not.toContain(pair.token); });
  it("accepts a valid sent token", () => expect(classifyTokenState({ status: "SENT", tokenExpiresAt: new Date(Date.now() + 1000), tokenUsedAt: null })).toBe("valid"));
  it("rejects expired, used and void tokens", () => { expect(classifyTokenState({ status: "SENT", tokenExpiresAt: new Date(Date.now() - 1), tokenUsedAt: null })).toBe("expired"); expect(classifyTokenState({ status: "SIGNED", tokenExpiresAt: new Date(Date.now() + 1000), tokenUsedAt: new Date() })).toBe("used"); expect(classifyTokenState({ status: "VOID", tokenExpiresAt: new Date(Date.now() + 1000), tokenUsedAt: null })).toBe("void"); });
});

