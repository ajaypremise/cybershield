import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send: mocks.send }; } }));

import { sendCompletedAgreement, sendPurchaseConfirmation } from "@/lib/email";

beforeEach(() => {
  mocks.send.mockReset();
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "CyberShield <support@updates.cybershieldau.com.au>";
  process.env.CYBERSHIELD_INTERNAL_EMAIL = "info@cybershieldau.com.au";
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

describe("Resend workflows", () => {
  it("accepts the Resend data and error result shape and returns the email ID", async () => {
    mocks.send.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const result = await sendPurchaseConfirmation("jane@example.com", {
      customerName: "Jane", customerId: "CSA-ABC234", tenure: "12 months", amount: "A$100.00", agentName: "Alex", confirmationDate: "17 July 2026",
    }, Buffer.from("pdf"));

    expect(result).toBe("email_123");
    expect(console.info).toHaveBeenCalledWith("Resend email sent", { operation: "purchase_confirmation", emailId: "email_123" });
  });

  it("surfaces and safely logs a purchase-confirmation provider failure", async () => {
    mocks.send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "provider unavailable", statusCode: 422 } });

    await expect(sendPurchaseConfirmation("jane@example.com", {
      customerName: "Jane", customerId: "CSA-ABC234", tenure: "12 months", amount: "A$100.00", agentName: "Alex", confirmationDate: "17 July 2026",
    }, Buffer.from("pdf"))).rejects.toThrow("provider unavailable");

    expect(console.error).toHaveBeenCalledWith("Resend email send failed", {
      operation: "purchase_confirmation",
      error: { name: "validation_error", message: "provider unavailable", statusCode: 422 },
    });
  });

  it("delivers the signed PDF to both recipients and returns both IDs", async () => {
    mocks.send.mockResolvedValueOnce({ data: { id: "customer-message" }, error: null }).mockResolvedValueOnce({ data: { id: "internal-message" }, error: null });
    const result = await sendCompletedAgreement({ customerEmail: "jane@example.com", customerName: "Jane", agreementNumber: "CSA-AGR-ABC234", pdf: Buffer.from("pdf") });
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ customerId: "customer-message", internalId: "internal-message" });
    expect(mocks.send.mock.calls[0][0].to).toBe("jane@example.com");
    expect(mocks.send.mock.calls[1][0].to).toBe("info@cybershieldau.com.au");
  });
});
