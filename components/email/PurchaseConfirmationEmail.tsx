import { Heading, Text } from "@react-email/components";
import { EmailShell } from "@/components/email/EmailShell";

export type PurchaseEmailProps = {
  firstName: string; lastName?: string | null; customerId: string; address: string; coverageDate: string;
};

export function PurchaseConfirmationEmail(props: PurchaseEmailProps) {
  const name = [props.firstName, props.lastName].filter(Boolean).join(" ");
  return <EmailShell preview={`CyberShield confirmation for ${props.customerId}`}>
    <Heading style={{ margin: "0 0 16px", color: "#111", fontSize: 26 }}>Your CyberShield confirmation</Heading>
    <Text style={copy}>Dear {name},</Text>
    <Text style={copy}>Thank you for choosing CyberShield. Your customer ID is <strong>{props.customerId}</strong>.</Text>
    <Text style={copy}>Service address: {props.address}</Text>
    <Text style={copy}>Coverage date: {props.coverageDate}</Text>
    <Text style={copy}>Your confirmation PDF is attached. For assistance, contact info@cybershieldau.com.au or call 1800 997 002.</Text>
  </EmailShell>;
}

export function purchaseConfirmationText(props: PurchaseEmailProps) {
  const name = [props.firstName, props.lastName].filter(Boolean).join(" ");
  return `Dear ${name},\n\nThank you for choosing CyberShield.\nCustomer ID: ${props.customerId}\nService address: ${props.address}\nCoverage date: ${props.coverageDate}\n\nYour confirmation PDF is attached.\nCyberShield Australia`;
}

const copy = { color: "#3d4652", fontSize: 14, lineHeight: "23px" };

