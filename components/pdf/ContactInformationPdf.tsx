import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type ConfirmationPdfProps = { firstName: string; lastName?: string | null; customerId: string; address: string; coverageDate: string };
export function confirmationPdfText(props: ConfirmationPdfProps) {
  return ["CYBERSHIELD CUSTOMER CONFIRMATION", `Customer: ${[props.firstName, props.lastName].filter(Boolean).join(" ")}`, `Customer ID: ${props.customerId}`, `Service address: ${props.address}`, `Coverage date: ${props.coverageDate}`, "Support: 1800 997 002", "Email: info@cybershieldau.com.au"].join("\n");
}
const styles = StyleSheet.create({ page: { padding: 52, fontFamily: "Helvetica", color: "#20252c" }, title: { fontSize: 22, fontWeight: 700, borderBottom: "3 solid #f5c400", paddingBottom: 14, marginBottom: 26 }, body: { fontSize: 11, lineHeight: 1.8 }, box: { border: "1 solid #d7d7d7", padding: 22 }, footer: { position: "absolute", bottom: 30, left: 52, right: 52, fontSize: 8, color: "#68717d", textAlign: "center" } });
export function ContactInformationPdf(props: ConfirmationPdfProps) {
  return <Document title={`CyberShield confirmation ${props.customerId}`} author="CyberShield Australia"><Page size="A4" style={styles.page}>
    <Text style={styles.title}>CyberShield Customer Confirmation</Text><View style={styles.box}><Text style={styles.body}>{confirmationPdfText(props)}</Text></View>
    <Text style={styles.footer}>CyberShield Australia · 121 Collins Street, Melbourne VIC 3000</Text>
  </Page></Document>;
}

