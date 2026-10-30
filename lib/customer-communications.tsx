import {Heading,Section,Text,Button} from "@react-email/components";
import {EmailShell} from "@/components/email/EmailShell";
export const firewallSubject="CyberShield Firewall 6.0 — Your Security Upgrade Review";
export type FirewallDetails={customerName:string;customerId:string};
export function FirewallUpgradeEmail({details:d}:{details:FirewallDetails}){
 return <EmailShell preview="Firewall 6.0 security review available — call CyberShield or reply YES to request a review.">
 <Text style={{color:"#089bc5",fontWeight:700,letterSpacing:2,fontSize:12}}>CUSTOMER SECURITY UPDATE · FIREWALL 6.0</Text>
 <Heading style={{color:"#0b1c35",fontSize:29,lineHeight:"36px"}}>Your security deserves an updated review.</Heading>
 <Text>Dear {d.customerName},</Text>
 <Text>CyberShield Firewall 6.0 is available for review for eligible customers. It introduces updated security configuration options designed for modern devices, networks and changing online risks.</Text>
 <Section style={{backgroundColor:"#eef9fd",borderLeft:"4px solid #39c9f6",padding:"16px 20px"}}>
 <Text style={{fontWeight:700,color:"#0b1c35"}}>What a Firewall 6.0 review can help with</Text>
 <Text>✓ Smarter filtering of suspicious connections and unsafe websites</Text>
 <Text>✓ Security settings for connected devices and home networks</Text>
 <Text>✓ Updated privacy and network configuration options</Text>
 <Text>✓ A review of compatibility with your current setup</Text>
 </Section>
 <Heading style={{fontSize:20,color:"#0b1c35"}}>Request your upgrade review</Heading>
 <Text>Speak to our team to check whether Firewall 6.0 is suitable for your existing service and devices.</Text>
 <Section style={{textAlign:"center",padding:"16px 0"}}>
 <Button href="tel:1800997002" style={{backgroundColor:"#0b1c35",color:"#ffffff",padding:"15px 25px",borderRadius:8,fontWeight:700}}>Call 1800 997 002</Button>
 </Section>
 <Text style={{textAlign:"center",fontWeight:700,color:"#0b1c35"}}>Prefer a callback? Simply reply YES to this email.</Text>
 <Text style={{fontSize:13,color:"#596579"}}>Customer ID: {d.customerId}. Suitability depends on your current devices, network and service. No changes will be made without discussing them with you. This message does not confirm an upgrade, extend existing coverage or request payment.</Text>
 <Text>CyberShield Customer Protection Team</Text>
 </EmailShell>;
}
export function firewallText(d:FirewallDetails){return `Dear ${d.customerName},\n\nCyberShield Firewall 6.0 is available for review for eligible customers. Updated configuration options may help with suspicious connections, device security, privacy controls and modern networks.\n\nCall 1800 997 002 or reply YES to request a review.\n\nSuitability depends on your current setup. No changes will be made without discussing them with you. This is not confirmation of an upgrade or payment.\n\nCustomer ID: ${d.customerId}\nCyberShield Customer Protection Team\ninfo@cybershieldau.com.au`;}
