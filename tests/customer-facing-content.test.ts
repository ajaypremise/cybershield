import { describe, expect, it } from "vitest";
import { purchaseConfirmationText } from "@/components/email/PurchaseConfirmationEmail";
import { confirmationPdfText } from "@/components/pdf/ContactInformationPdf";
import { createAgreementSnapshot } from "@/lib/agreement/content";
const safe = { firstName: "Taylor", lastName: "Ng", customerId: "CS-2026-000001", address: "1 Test St", coverageDate: "2026-07-17" };
describe("customer-facing content boundary", () => {
  it("confirmation email and PDF contain no internal sales fields", () => { const output = `${purchaseConfirmationText(safe)}\n${confirmationPdfText(safe)}`; for (const forbidden of ["sales amount", "agent name", "primary issue", "internal note", "service details"]) expect(output.toLowerCase()).not.toContain(forbidden); });
  it("agreement snapshot contains only customer-safe header fields", () => { const output = createAgreementSnapshot({ agreementNumber: "AGR-1", customerId: safe.customerId, customerName: "Taylor Ng", email: "t@example.com", address: safe.address, coverageDate: safe.coverageDate }).toLowerCase(); for (const forbidden of ["amount paid", "assisted by", "primary issue", "internal note"]) expect(output).not.toContain(forbidden); });
});

