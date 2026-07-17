import { describe, expect, it } from "vitest";
import { decodeSignature, purchaseInputSchema } from "@/lib/validation";

const purchase = { customerName: "Jane", customerEmail: "jane@example.com", tenure: "12 months", amountPaid: "100.00", agentName: "Alex", submissionKey: "f47ac10b-58cc-4372-a567-0e02b2c3d479", csrfToken: "a".repeat(64) };

describe("validation", () => {
  it("rejects zero, negative and malformed amounts", () => { for (const amountPaid of ["0", "-1", "1.234", "NaN"]) expect(purchaseInputSchema.safeParse({ ...purchase, amountPaid }).success).toBe(false); });
  it("rejects an empty signature", () => expect(() => decodeSignature("data:image/png;base64," )).toThrow());
  it("rejects an oversized signature", () => { const bytes = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), Buffer.alloc(500_001)]); expect(() => decodeSignature(`data:image/png;base64,${bytes.toString("base64")}`)).toThrow("too large"); });
});

