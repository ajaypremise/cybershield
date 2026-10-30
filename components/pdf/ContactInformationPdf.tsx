import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { backgroundColor: "#F3F7FB", fontFamily: "Helvetica", color: "#10233F" },
  hero: { backgroundColor: "#081A34", paddingTop: 43, paddingHorizontal: 46, paddingBottom: 39, borderBottom: "5 solid #22C7EE" },
  eyebrow: { color: "#74DDF5", fontSize: 9, letterSpacing: 2.1, marginTop: 24 },
  heading: { color: "#FFFFFF", fontSize: 27, fontWeight: 700, marginTop: 9 },
  intro: { color: "#B9CCDF", fontSize: 10, marginTop: 10, lineHeight: 1.5 },
  logo: { width: 195, height: 53, objectFit: "contain", objectPosition: "left" },
  fallbackLogo: { color: "#FFFFFF", fontSize: 24, fontWeight: 700 },
  body: { paddingHorizontal: 46, paddingTop: 28 },
  idCard: { backgroundColor: "#FFFFFF", border: "1 solid #D9E5F0", borderLeft: "5 solid #22C7EE", borderRadius: 7, paddingVertical: 17, paddingHorizontal: 22 },
  idLabel: { color: "#52708E", fontSize: 9, letterSpacing: 1.4 },
  idValue: { color: "#081A34", fontSize: 23, fontWeight: 700, marginTop: 6 },
  sectionHeading: { fontSize: 11, color: "#193C60", fontWeight: 700, marginTop: 27, marginBottom: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  tile: { width: "48.6%", backgroundColor: "#FFFFFF", border: "1 solid #DDE7F0", borderRadius: 6, paddingHorizontal: 17, paddingVertical: 15, marginBottom: 10, minHeight: 69 },
  tileLabel: { color: "#54718D", fontSize: 8, letterSpacing: 1, marginBottom: 7 },
  tileValue: { color: "#0B2744", fontSize: 12, fontWeight: 700 },
  detailCard: { backgroundColor: "#E5F1F8", borderRadius: 6, padding: 17, marginTop: 8 },
  detailLabel: { color: "#45647D", fontSize: 8, letterSpacing: 1, marginBottom: 6 },
  detailValue: { color: "#102D49", fontSize: 11, fontWeight: 700 },
  hours: { marginBottom: 14 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#081A34", paddingHorizontal: 46, paddingVertical: 20 },
  footerBrand: { color: "#FFFFFF", fontSize: 10, fontWeight: 700 },
  footerNote: { color: "#AFC4D9", fontSize: 8, marginTop: 6, lineHeight: 1.5 },
});

export type ConfirmationPdfProps = { confirmationNumber: string; customerName: string; customerId: string; address: string; serviceName: string; amount: string; saleDate: string; coverageStart: string; coverageDuration: string; coverageEnd?: string; issueTimestamp: string; serviceSummary: string; logoDataUrl?: string };
export function confirmationPdfText(p: ConfirmationPdfProps) { return `CyberShield Australia contact information for ${p.customerId}: 1800 997 002, info@cybershieldau.com.au`; }

const contacts = [
  ["TOLL FREE SUPPORT", "1800 997 002"],
  ["SUPPORT", "(03) 7046 5922"],
  ["BILLING", "(04) 6825 8207"],
  ["EMAIL", "info@cybershieldau.com.au"],
  ["WEBSITE", "cybershieldau.com.au"],
] as const;

export function ContactInformationPdf(p: ConfirmationPdfProps) {
  return <Document title="CyberShield Contact Information" author="CyberShield Australia">
    <Page size="A4" style={s.page}>
      <View style={s.hero}>
        {p.logoDataUrl ? <Image src={p.logoDataUrl} style={s.logo} /> : <Text style={s.fallbackLogo}>CyberShield Australia</Text>}
        <Text style={s.eyebrow}>CYBERSHIELD AUSTRALIA</Text>
        <Text style={s.heading}>Your support contacts</Text>
        <Text style={s.intro}>Your essential CyberShield contact information, all in one place.</Text>
      </View>
      <View style={s.body}>
        <View style={s.idCard}>
          <Text style={s.idLabel}>YOUR CUSTOMER ID</Text>
          <Text style={s.idValue}>{p.customerId}</Text>
        </View>
        <Text style={s.sectionHeading}>Get in touch</Text>
        <View style={s.grid}>
          {contacts.map(([label, value]) => <View key={label} style={s.tile}><Text style={s.tileLabel}>{label}</Text><Text style={s.tileValue}>{value}</Text></View>)}
        </View>
        <View style={s.detailCard}>
          <View style={s.hours}><Text style={s.detailLabel}>SUPPORT HOURS</Text><Text style={s.detailValue}>10 AM to 9 PM AEST</Text></View>
          <Text style={s.detailLabel}>ADDRESS</Text>
          <Text style={s.detailValue}>121 Collins St, Melbourne VIC 3000</Text>
        </View>
      </View>
      <View style={s.footer}>
        <Text style={s.footerBrand}>CYBERSHIELD AUSTRALIA</Text>
        <Text style={s.footerNote}>Keep this document with your CyberShield service records. Support hours are stated in Australian Eastern Standard Time.</Text>
      </View>
    </Page>
  </Document>;
}
