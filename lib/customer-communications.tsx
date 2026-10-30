import { Heading, Section, Text } from "@react-email/components";
import { EmailShell } from "@/components/email/EmailShell";
import { SERVICES } from "@/lib/services";
import type { ServiceType } from "@prisma/client";

export type CommunicationDetails = {customerName:string; customerId:string; service:ServiceType; amount:string; years:number; message:string};
export function customerCommunicationSubject(d:CommunicationDetails) { return `CyberShield ${SERVICES[d.service].name} — Service Information (${d.customerId})`; }
export function CustomerCommunicationEmail({details:d}:{details:CommunicationDetails}) {
 const service=SERVICES[d.service];
 return <EmailShell preview={customerCommunicationSubject(d)}>
   <Heading style={{color:"#0b1c35",fontSize:25,margin:"0 0 18px"}}>{service.name}</Heading>
   <Text>Dear {d.customerName},</Text>
   <Text>Thank you for contacting CyberShield. Please review the following service information.</Text>
   <Section style={{border:"1px solid #dce5f1",borderLeft:"5px solid #39c9f6",padding:18}}>
     <Text><strong>Customer ID:</strong> {d.customerId}</Text>
     <Text><strong>Service:</strong> {service.name}</Text>
     <Text><strong>Proposed amount:</strong> {d.amount}</Text>
     <Text><strong>Proposed coverage:</strong> {d.years} {d.years===1?"year":"years"}</Text>
   </Section>
   <Text>{service.summary}</Text>
   {d.message && <Section style={{padding:"12px 0"}}><Text><strong>Additional message from our team</strong></Text><Text style={{whiteSpace:"pre-wrap"}}>{d.message}</Text></Section>}
   <Text style={{fontSize:12,color:"#596579"}}>This message provides service information only. It does not change an existing purchase, extend coverage, confirm payment, or replace any signed service agreement. Your existing records remain unchanged.</Text>
   <Text>CyberShield Support Team</Text>
 </EmailShell>;
}
export function customerCommunicationText(d:CommunicationDetails) {
 return `Dear ${d.customerName},\n\nCyberShield ${SERVICES[d.service].name} service information\nCustomer ID: ${d.customerId}\nProposed amount: ${d.amount}\nProposed coverage: ${d.years} ${d.years===1?"year":"years"}\n\n${SERVICES[d.service].summary}\n\n${d.message}\n\nThis is service information only; existing purchases, coverage and agreements are unchanged.\nCyberShield Support Team`;
}
