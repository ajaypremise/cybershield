import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailShell } from "@/components/email/EmailShell";

export type SigningEmailProps = { customerName: string; customerId: string; tenure: string; amount: string; signingUrl: string; expires: string };

export function SigningRequestEmail(props: SigningEmailProps) {
  return (
    <EmailShell preview="Review and sign your CyberShield Agreement">
      <Heading style={{ margin: "0 0 16px", color: "#111", fontSize: 26 }}>Review and sign your agreement</Heading>
      <Text style={copy}>Dear {props.customerName},</Text>
      <Text style={copy}>Your CyberShield Service Agreement is ready for review and electronic signature.</Text>
      <Section style={{ margin: "22px 0", borderLeft: "5px solid #f5c400", background: "#f7f7f7", padding: "18px" }}>
        <Text style={detail}><strong>Customer ID:</strong> {props.customerId}</Text>
        <Text style={detail}><strong>Protection tenure:</strong> {props.tenure}</Text>
        <Text style={detail}><strong>Amount:</strong> {props.amount}</Text>
        <Text style={detail}><strong>Link expires:</strong> {props.expires}</Text>
      </Section>
      <Button href={props.signingUrl} style={{ display: "inline-block", borderRadius: 24, backgroundColor: "#f5c400", color: "#111", fontSize: 14, fontWeight: 700, padding: "13px 23px", textDecoration: "none" }}>Review and Sign Agreement</Button>
      <Text style={{ ...copy, marginTop: 24 }}><strong>Security notice:</strong> CyberShield will never request your password through the agreement page. The secure link is intended only for the named recipient.</Text>
      <Text style={copy}>Questions? Call 1800 997 002 or (03) 7046 5922 during 10:00 AM–9:00 PM AEST.</Text>
    </EmailShell>
  );
}

const copy = { color: "#3d4652", fontSize: 14, lineHeight: "23px" };
const detail = { margin: "5px 0", color: "#303844", fontSize: 14, lineHeight: "22px" };

export function signingRequestText(props: SigningEmailProps): string {
  return `Dear ${props.customerName},\n\nYour CyberShield Service Agreement is ready for review and electronic signature.\n\nCustomer ID: ${props.customerId}\nProtection tenure: ${props.tenure}\nAmount: ${props.amount}\nLink expires: ${props.expires}\n\nReview and sign: ${props.signingUrl}\n\nSecurity notice: CyberShield will never request your password through the agreement page.\n\nCyberShield Support: 1800 997 002 or (03) 7046 5922`;
}

