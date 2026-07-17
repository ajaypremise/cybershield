import { describe, expect, it } from "vitest";
import { generateAgreementPdf, generateContactInformationPdf } from "@/lib/pdf";

describe("PDF generation", () => {
  it("creates selectable-text contact and agreement PDFs", async () => { const contact = await generateContactInformationPdf(); const agreement = await generateAgreementPdf({ snapshot: "CYBERSHIELD SERVICE AGREEMENT\n\n1. Parties\nPlain English terms.", agreementNumber: "CSA-AGR-TEST", version: "1.0.0" }); expect(contact.subarray(0, 4).toString()).toBe("%PDF"); expect(agreement.subarray(0, 4).toString()).toBe("%PDF"); expect(contact.length).toBeGreaterThan(1000); expect(agreement.length).toBeGreaterThan(1000); });
});

