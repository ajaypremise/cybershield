import { describe, expect, it } from "vitest";
import { customerCommunicationSubject, customerCommunicationText, type CommunicationDetails } from "@/lib/customer-communications";
const base:CommunicationDetails={customerName:"Example Customer",customerId:"CS-2026-000042",service:"NETWORK_SECURITY",amount:"A$299.00",years:2,message:"Thank you",intro:"Approved introduction"};
describe("customer communications",()=>{
 it("retains the permanent customer ID and service selection",()=>{
  expect(customerCommunicationSubject(base)).toContain("CS-2026-000042");
  expect(customerCommunicationText(base)).toContain("Network Security");
  expect(customerCommunicationText({...base,service:"IDENTITY_IP_PROTECTOR"})).toContain("Identity & IP Protector");
 });
 it("clearly labels proposed terms and preserves existing records",()=>{
  const text=customerCommunicationText(base);
  expect(text).toContain("Proposed amount: A$299.00");
  expect(text).toContain("Proposed coverage: 2 years");
  expect(text).toContain("existing purchases, coverage and agreements are unchanged");
  expect(text).toContain("Approved introduction");
 });
});
