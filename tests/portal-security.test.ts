import { describe, expect, it } from "vitest";
import { isExactCustomerLookup, maskEmail, maskName } from "@/lib/masking";
describe("agent portal disclosure controls", () => {
  it("accepts only an exact customer ID or exact email", () => { expect(isExactCustomerLookup("CS-2026-000123")).toBe(true); expect(isExactCustomerLookup("person@example.com")).toBe(true); expect(isExactCustomerLookup("person")).toBe(false); expect(isExactCustomerLookup("CS-2026")).toBe(false); });
  it("masks names and email addresses", () => { expect(maskName("Alexandra", "Morgan")).toBe("A****** M*****"); expect(maskEmail("alexandra@example.com")).toBe("a********@example.com"); });
});

