import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 54, backgroundColor: "#ffffff", fontFamily: "Helvetica", color: "#151515" },
  band: { height: 10, backgroundColor: "#f5c400", margin: -54, marginBottom: 52 },
  brand: { fontSize: 31, fontWeight: 700, color: "#111111", letterSpacing: 0.5 },
  subtitle: { marginTop: 7, fontSize: 11, color: "#626262", letterSpacing: 1.2 },
  card: { marginTop: 42, border: "1 solid #dedede", borderLeft: "6 solid #f5c400", padding: 26 },
  row: { marginBottom: 17 }, label: { fontSize: 9, color: "#806600", letterSpacing: 1.2 }, value: { marginTop: 4, fontSize: 15 },
  footer: { position: "absolute", bottom: 42, left: 54, right: 54, borderTop: "1 solid #dedede", paddingTop: 12, fontSize: 9, color: "#707070" },
});

export function ContactInformationPdf() {
  const rows = [
    ["TOLL FREE SUPPORT", "1800 997 002"], ["SUPPORT", "(03) 7046 5922"], ["BILLING", "(04) 6825 8207"],
    ["EMAIL", "info@cybershieldau.com.au"], ["WEBSITE", "cybershieldau.com.au"], ["SUPPORT HOURS", "10 AM to 9 PM AEST"],
    ["ADDRESS", "121 Collins St, Melbourne VIC 3000"],
  ];
  return <Document title="CyberShield Contact Information" author="CyberShield Australia">
    <Page size="A4" style={styles.page}>
      <View style={styles.band} />
      <Text style={styles.brand}>CyberShield</Text><Text style={styles.subtitle}>AUSTRALIA · CONTACT INFORMATION</Text>
      <View style={styles.card}>{rows.map(([label, value]) => <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</View>
      <Text style={styles.footer}>Keep this document with your CyberShield service records. Support hours are stated in Australian Eastern Standard Time.</Text>
    </Page>
  </Document>;
}

