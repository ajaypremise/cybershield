import { describe, expect, it } from "vitest";
import { permanentCustomerId } from "@/lib/customer";
import { normalizeEmail, normalizePhone, portalConfirmationSchema } from "@/lib/validation";
describe("customer confirmation input", () => {
  it("creates deterministic permanent public IDs from immutable serials", () => { expect(permanentCustomerId(2026, BigInt(42))).toBe("CS-2026-000042"); });
  it("normalizes exact identifiers", () => { expect(normalizeEmail(" Person@Example.COM ")).toBe("person@example.com"); expect(normalizePhone("+61 (03) 7046 5922")).toBe("610370465922"); });
  it("supports AUD, USD and GBP and rejects non-positive amounts", () => {
    const base = { serviceType: "NETWORK_SECURITY", coverageStartDate: "2026-07-18", coverageType: "FIXED", tenureValue: "12", tenureUnit: "MONTHS", firstName: "A", lastName: "", email: "a@example.com", phone: "0399999999", alternatePhone: "", address: "1 Test St", salesAmount: "100.25", saleDate: "2026-07-17", agentName: "Agent", primaryIssue: "Security", serviceDetails: "Coverage", internalNotes: "private", submissionKey: crypto.randomUUID(), idempotencyKey: crypto.randomUUID(), csrfToken: "a".repeat(64), reuseToken: "" };
    for (const currency of ["AUD", "USD", "GBP"]) expect(portalConfirmationSchema.safeParse({ ...base, currency }).success).toBe(true);
    expect(portalConfirmationSchema.safeParse({ ...base, currency: "AUD", salesAmount: "0" }).success).toBe(false);
  });
});
