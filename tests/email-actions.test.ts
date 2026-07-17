import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  validateCsrf: vi.fn(),
  adminAudit: vi.fn(),
  upsertCustomer: vi.fn(),
  createPurchaseOnce: vi.fn(),
  sendPurchaseConfirmation: vi.fn(),
  generateContactInformationPdf: vi.fn(),
  enforceRateLimit: vi.fn(),
  requestContext: vi.fn(),
  logInternalFailure: vi.fn(),
  purchaseUpdate: vi.fn(),
  purchaseFindUnique: vi.fn(),
  purchaseCreate: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ validateCsrf: mocks.validateCsrf }));
vi.mock("@/lib/audit", () => ({ adminAudit: mocks.adminAudit }));
vi.mock("@/lib/customer", () => ({ upsertCustomer: mocks.upsertCustomer }));
vi.mock("@/lib/purchase", () => ({ createPurchaseOnce: mocks.createPurchaseOnce }));
vi.mock("@/lib/email", () => ({ sendPurchaseConfirmation: mocks.sendPurchaseConfirmation }));
vi.mock("@/lib/pdf", () => ({ generateContactInformationPdf: mocks.generateContactInformationPdf }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: mocks.enforceRateLimit }));
vi.mock("@/lib/request", () => ({ requestContext: mocks.requestContext }));
vi.mock("@/lib/internal-log", () => ({ logInternalFailure: mocks.logInternalFailure }));
vi.mock("@/lib/db", () => ({ prisma: { purchase: { update: mocks.purchaseUpdate, findUnique: mocks.purchaseFindUnique, create: mocks.purchaseCreate } } }));
vi.mock("@/lib/validation", () => ({
  purchaseInputSchema: { safeParse: () => ({ success: true, data: { customerName: "Jane", customerEmail: "jane@example.com", tenure: "12 months", amountPaid: "100.00", agentName: "Alex", submissionKey: "9d9a00f6-0192-49ac-95b7-351cb9f2830a", csrfToken: "csrf" } }) },
  agreementActionSchema: { safeParse: () => ({ success: false }) },
}));

import { sendPurchaseConfirmationAction } from "@/app/email/actions";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.redirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`); });
  mocks.requestContext.mockResolvedValue({ ip: "127.0.0.1" });
  mocks.upsertCustomer.mockResolvedValue({ id: "customer_1", name: "Jane", email: "jane@example.com", customerId: "CSA-ABC234" });
  mocks.createPurchaseOnce.mockResolvedValue({ created: true, record: { id: "purchase_1", tenure: "12 months", amountPaid: "100.00", agentName: "Alex" } });
  mocks.generateContactInformationPdf.mockResolvedValue(Buffer.from("pdf"));
  mocks.sendPurchaseConfirmation.mockResolvedValue("email_123");
  mocks.purchaseUpdate.mockResolvedValue({});
});

describe("purchase confirmation action", () => {
  it("reports success and saves the Resend ID even when the later audit write fails", async () => {
    mocks.adminAudit.mockRejectedValue(new Error("audit unavailable"));

    await expect(sendPurchaseConfirmationAction(new FormData())).rejects.toThrow("REDIRECT:/email?sent=purchase_1");

    expect(mocks.sendPurchaseConfirmation).toHaveBeenCalledTimes(1);
    expect(mocks.purchaseUpdate).toHaveBeenCalledWith({
      where: { id: "purchase_1" },
      data: { status: "SENT", confirmationSentAt: expect.any(Date), resendEmailId: "email_123" },
    });
    expect(mocks.logInternalFailure).toHaveBeenCalledWith("purchase_confirmation_audit", expect.any(Error));
    expect(mocks.redirect).not.toHaveBeenCalledWith(expect.stringContaining("email delivery failed"));
  });
});
