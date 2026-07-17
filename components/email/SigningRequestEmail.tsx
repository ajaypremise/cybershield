import { Button, Heading, Text } from "@react-email/components";
import { EmailShell } from "@/components/email/EmailShell";

export type SigningEmailProps = { customerName: string; customerId: string; signingUrl: string; expiresAt: string };

export function SigningRequestEmail(props: SigningEmailProps) {
  return <EmailShell preview="Review and sign your CyberShield agreement">
    <Heading style={{ margin: "0 0 16px", color: "#111", fontSize: 26 }}>Review and sign your agreement</Heading>
    <Text style={copy}>Dear {props.customerName},</Text>
    <Text style={copy}>Your CyberShield service agreement for customer ID <strong>{props.customerId}</strong> is ready.</Text>
    <Button href={props.signingUrl} style={{ background: "#2f7dff", color: "white", padding: "12px 20px", borderRadius: 999 }}>Review and sign</Button>
    <Text style={copy}>This secure link expires {props.expiresAt}. If you did not expect this email, contact CyberShield.</Text>
  </EmailShell>;
}

export function signingRequestText(props: SigningEmailProps) {
  return `Dear ${props.customerName},\n\nYour CyberShield agreement for customer ID ${props.customerId} is ready.\nReview and sign: ${props.signingUrl}\nThis link expires ${props.expiresAt}.`;
}
const copy = { color: "#3d4652", fontSize: 14, lineHeight: "23px" };

