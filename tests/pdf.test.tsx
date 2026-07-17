import { describe, expect, it } from "vitest";
import { generateAgreementPdf, generateCustomerConfirmationPdf } from "@/lib/pdf";
describe("PDF generation", () => {
  it("creates selectable-text confirmation and agreement PDFs", async () => { const confirmation = await generateCustomerConfirmationPdf({ firstName: "Jane", lastName: "Ng", customerId: "CS-2026-000001", address: "1 Test St", coverageDate: "2026-07-17" }); const agreement = await generateAgreementPdf({ snapshot: "CYBERSHIELD SERVICE AGREEMENT\n\n1. Parties\nPlain English terms.", agreementNumber: "CSA-AGR-TEST", version: "1.1.0" }); expect(confirmation.subarray(0, 4).toString()).toBe("%PDF"); expect(agreement.subarray(0, 4).toString()).toBe("%PDF"); expect(confirmation.length).toBeGreaterThan(1000); expect(agreement.length).toBeGreaterThan(1000); });
});
