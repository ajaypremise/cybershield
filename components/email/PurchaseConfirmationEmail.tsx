import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailShell } from "@/components/email/EmailShell";

export type PurchaseEmailProps = {
  customerName: string;
  customerId: string;
  tenure: string;
  amount: string;
  agentName: string;
  confirmationDate: string;
};

const bullet = (text: string) => <Text style={{ margin: "5px 0", color: "#3d4652", fontSize: 14, lineHeight: "22px" }}>• {text}</Text>;

export function PurchaseConfirmationEmail(props: PurchaseEmailProps) {
  return (
    <EmailShell preview={`CyberShield protection confirmed for ${props.customerId}`}>
      <Heading style={{ margin: "0 0 18px", color: "#111", fontSize: 27 }}>Welcome to CyberShield</Heading>
      <Text style={copy}>Dear {props.customerName},</Text>
      <Text style={copy}>Welcome to CyberShield, and thank you for choosing us to help protect your business and connected devices.</Text>
      <Text style={copy}>This email confirms your CyberShield security and support package.</Text>

      <Section style={{ margin: "26px 0", border: "1px solid #e5e5e5", borderLeft: "5px solid #f5c400", backgroundColor: "#fafafa", padding: "20px" }}>
        <Text style={label}>CUSTOMER ID</Text>
        <Text style={{ margin: "4px 0 16px", color: "#111", fontSize: 25, fontWeight: 700 }}>{props.customerId}</Text>
        <Text style={detail}><strong>Protection tenure:</strong> {props.tenure}</Text>
        <Text style={detail}><strong>Amount paid:</strong> {props.amount}</Text>
        <Text style={detail}><strong>Assisted by:</strong> {props.agentName}</Text>
        <Text style={detail}><strong>Confirmation date:</strong> {props.confirmationDate}</Text>
      </Section>

      <Heading as="h2" style={heading}>YOUR CYBERSHIELD PROTECTION</Heading>
      <Text style={copy}>Your solution is designed around the security requirements of your premises, including the number and types of connected devices, users, network configuration and selected protection services.</Text>
      <Text style={copy}>Depending on your agreed solution, protection may cover devices such as:</Text>
      {bullet("Desktop computers and laptops")}{bullet("Servers and network storage")}{bullet("Printers and other connected equipment")}{bullet("Smart televisions and compatible connected devices")}{bullet("Mobile devices connected through the protected network")}

      <Heading as="h2" style={heading}>HOW YOUR PROTECTION WORKS</Heading>
      <Text style={copy}>CyberShield protection operates primarily at the network and security-infrastructure level. This means you may not see a separate application, popup or dashboard on every protected device.</Text>
      <Text style={copy}>Your security controls operate continuously in the background, helping inspect network activity and prevent suspicious or malicious connections before they reach devices within the protected environment.</Text>

      <Heading as="h2" style={heading}>SERVICES INCLUDED</Heading>
      <Text style={copy}>Your package may include, according to your selected configuration:</Text>
      {bullet("Managed firewall and network security")}{bullet("Malicious IP and reputation-based blocking")}{bullet("Intrusion and suspicious-activity prevention")}{bullet("Security software updates and installation assistance")}{bullet("Device and computer optimisation assistance")}{bullet("Identity-protection support")}{bullet("Security guidance and technical support")}
      <Text style={copy}>Because every CyberShield solution is tailored, the precise coverage will be determined by the services included in your confirmed plan.</Text>

      <Hr style={{ borderColor: "#e5e5e5", margin: "28px 0" }} />
      <Heading as="h2" style={heading}>NEED ASSISTANCE?</Heading>
      <Text style={detail}>Support: 1800 997 002 or (03) 7046 5922<br />Billing: (04) 6825 8207<br />Email: info@cybershieldau.com.au<br />Support hours: 10:00 AM–9:00 PM AEST</Text>
      <Text style={copy}>Our contact-information document is attached for your records.</Text>
      <Text style={copy}>Thank you for choosing CyberShield.</Text>
      <Text style={copy}>Kind regards,<br /><strong>{props.agentName}</strong><br />CyberShield Support Team</Text>
    </EmailShell>
  );
}

const copy = { color: "#3d4652", fontSize: 14, lineHeight: "23px", margin: "12px 0" };
const heading = { color: "#111", fontSize: 15, letterSpacing: "0.06em", margin: "28px 0 10px" };
const label = { margin: 0, color: "#806600", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" };
const detail = { margin: "5px 0", color: "#303844", fontSize: 14, lineHeight: "22px" };

export function purchaseConfirmationText(props: PurchaseEmailProps): string {
  return `Dear ${props.customerName},\n\nWelcome to CyberShield, and thank you for choosing us to help protect your business and connected devices.\n\nThis email confirms your CyberShield security and support package.\n\nCUSTOMER DETAILS\nCustomer ID: ${props.customerId}\nProtection tenure: ${props.tenure}\nAmount paid: ${props.amount}\nAssisted by: ${props.agentName}\nConfirmation date: ${props.confirmationDate}\n\nYOUR CYBERSHIELD PROTECTION\nYour solution is designed around the security requirements of your premises, including the number and types of connected devices, users, network configuration and selected protection services.\n\nHOW YOUR PROTECTION WORKS\nCyberShield protection operates primarily at the network and security-infrastructure level. This means you may not see a separate application, popup or dashboard on every protected device.\n\nSERVICES INCLUDED\nYour package may include managed firewall and network security, malicious-IP blocking, intrusion prevention, software-update assistance, optimisation assistance, identity-protection support, and security guidance according to your selected configuration.\n\nNEED ASSISTANCE?\nSupport: 1800 997 002 or (03) 7046 5922\nBilling: (04) 6825 8207\nEmail: info@cybershieldau.com.au\nSupport hours: 10:00 AM–9:00 PM AEST\n\nKind regards,\n${props.agentName}\nCyberShield Support Team\n121 Collins Street\nMelbourne VIC 3000\nwww.cybershieldau.com.au`;
}

