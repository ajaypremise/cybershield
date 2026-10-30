import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { CustomerCommunicationEmail, customerCommunicationSubject, customerCommunicationText } from "@/lib/customer-communications";
import { SERVICES } from "@/lib/services";

describe("approved customer service communications", () => {
 for (const service of ["NETWORK_SECURITY", "IDENTITY_IP_PROTECTOR"] as const) {
  it(`preserves customer ID and approved service copy for ${service}`, () => {
   const details = { customerName: "Jane Smith", customerId: "CSA-000123", service, amount: "A$250.00", years: 3, message: "Please call our team.", intro: "Thank you for your enquiry." };
   const subject = customerCommunicationSubject(details);
   const text = customerCommunicationText(details);
   const html = renderToStaticMarkup(createElement(CustomerCommunicationEmail, { details }));
   expect(subject).toContain("CSA-000123");
   expect(text).toContain("CSA-000123");
   expect(text).toContain(SERVICES[service].summary);
   expect(text).toContain("3 years");
   expect(text).toContain("A$250.00");
   expect(html).toContain("CSA-000123");
   expect(html).toContain(SERVICES[service].name.replace("&", "&amp;").split(" ")[0]);
   expect(html).toContain("Please call our team.");
  });
 }
});
