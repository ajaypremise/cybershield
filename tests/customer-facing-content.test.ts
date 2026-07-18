import { describe, expect, it } from "vitest";
import { purchaseConfirmationText } from "@/components/email/PurchaseConfirmationEmail";
import { confirmationPdfText } from "@/components/pdf/ContactInformationPdf";
import { createAgreementSnapshot } from "@/lib/agreement/content";
import { confirmationFixture, pdfFixture } from "./fixtures";
describe("customer-facing content boundary", () => {
  it("uses the selected service and omits internal fields", () => { const output=`${purchaseConfirmationText(confirmationFixture)}\n${confirmationPdfText(pdfFixture)}`; expect(output).toContain("Network Security"); for(const value of ["agent name","primary issue","internal note","service details"]) expect(output.toLowerCase()).not.toContain(value); });
  it("creates service-specific finite agreement content", () => { const output=createAgreementSnapshot({agreementNumber:"AGR-1",customerId:"CS-1",customerName:"Taylor Ng",email:"t@example.com",address:"1 Test St",serviceType:"NETWORK_SECURITY",amount:"AUD 499.00",saleDate:"17 July 2026",coverageStart:"18 July 2026",coverageEnd:"17 July 2027",coverageType:"FIXED",tenureValue:12,tenureUnit:"MONTHS"}); expect(output).toContain("Scope of Network Security"); expect(output).not.toContain("Lifetime coverage terms"); });
});