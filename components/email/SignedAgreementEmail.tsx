import { Heading, Text } from "@react-email/components";
import { EmailShell } from "@/components/email/EmailShell";

export function SignedAgreementEmail({ customerName, agreementNumber, internal = false }: { customerName: string; agreementNumber: string; internal?: boolean }) {
  return (
    <EmailShell preview={`Signed CyberShield Agreement ${agreementNumber}`}>
      <Heading style={{ margin: "0 0 16px", color: "#111", fontSize: 26 }}>Agreement completed</Heading>
      <Text style={copy}>{internal ? "CyberShield team," : `Dear ${customerName},`}</Text>
      <Text style={copy}>{internal ? `${customerName} has signed` : "Thank you. You have successfully signed"} CyberShield Agreement <strong>{agreementNumber}</strong>.</Text>
      <Text style={copy}>A PDF copy of the completed agreement and its audit certificate is attached for your records.</Text>
      <Text style={copy}>For assistance, contact info@cybershieldau.com.au or call 1800 997 002.</Text>
    </EmailShell>
  );
}

const copy = { color: "#3d4652", fontSize: 14, lineHeight: "23px" };

