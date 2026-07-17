import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { maskIp } from "@/lib/format";

export type AgreementPdfProps = {
  snapshot: string; agreementNumber: string; version: string; logoDataUrl?: string;
  signed?: { typedName: string; signedAtUtc: string; signedAtAest: string; ip: string | null; documentHash: string; signatureDataUrl: string };
};

const styles = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", fontSize: 9.5, lineHeight: 1.55, color: "#20252c" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "3 solid #f5c400", paddingBottom: 13, marginBottom: 20 },
  logo: { width: 155, height: 40, objectFit: "contain" }, brand: { fontSize: 22, fontWeight: 700 }, meta: { fontSize: 8, color: "#626b78", textAlign: "right" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 12 }, line: { marginBottom: 5 }, heading: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 5, color: "#111" },
  signatureBox: { marginTop: 22, border: "1 solid #d7d7d7", borderLeft: "5 solid #f5c400", padding: 18 }, signature: { width: 180, height: 70, objectFit: "contain", marginVertical: 9 },
  footer: { position: "absolute", bottom: 20, left: 44, right: 44, fontSize: 7.5, color: "#747c87", textAlign: "center" },
  auditCard: { marginTop: 20, border: "1 solid #d7d7d7", padding: 20 }, hash: { fontFamily: "Courier", fontSize: 8, marginTop: 5 },
});

function Header({ number, version, logo }: { number: string; version: string; logo?: string }) {
  return <View style={styles.header}>{logo ? <Image src={logo} style={styles.logo} /> : <Text style={styles.brand}>CyberShield</Text>}<Text style={styles.meta}>{number}{"\n"}Version {version}</Text></View>;
}

export function AgreementPdf({ snapshot, agreementNumber, version, logoDataUrl, signed }: AgreementPdfProps) {
  const lines = snapshot.split("\n");
  return <Document title={`CyberShield Agreement ${agreementNumber}`} author="CyberShield Australia">
    <Page size="A4" style={styles.page} wrap>
      <Header number={agreementNumber} version={version} logo={logoDataUrl} />
      {lines.map((line, index) => {
        const heading = /^\d+\./.test(line) || line === "CYBERSHIELD SERVICE AGREEMENT";
        return <Text key={`${index}-${line.slice(0, 12)}`} style={heading ? (index === 0 ? styles.title : styles.heading) : styles.line}>{line || " "}</Text>;
      })}
      {signed && <View style={styles.signatureBox} wrap={false}>
        <Text style={styles.heading}>Electronic acceptance</Text><Text>Typed legal name: {signed.typedName}</Text>
        <Image src={signed.signatureDataUrl} style={styles.signature} />
        <Text>Signed: {signed.signedAtUtc}</Text><Text>Australia/Melbourne: {signed.signedAtAest}</Text><Text>Signing IP: {maskIp(signed.ip)}</Text>
        <Text style={styles.hash}>Verification reference: {signed.documentHash}</Text>
      </View>}
      <Text style={styles.footer}>CyberShield Australia · 121 Collins Street, Melbourne VIC 3000 · info@cybershieldau.com.au</Text>
    </Page>
    {signed && <Page size="A4" style={styles.page}>
      <Header number={agreementNumber} version={version} logo={logoDataUrl} />
      <Text style={styles.title}>Audit certificate</Text>
      <Text>This page records evidence produced by CyberShield's electronic signing workflow. It should be retained with the complete agreement.</Text>
      <View style={styles.auditCard}>
        <Text style={styles.heading}>Agreement</Text><Text>{agreementNumber}, version {version}</Text>
        <Text style={styles.heading}>Signer</Text><Text>{signed.typedName}</Text>
        <Text style={styles.heading}>Signed time</Text><Text>{signed.signedAtUtc}</Text><Text>{signed.signedAtAest}</Text>
        <Text style={styles.heading}>Network reference</Text><Text>{maskIp(signed.ip)}</Text>
        <Text style={styles.heading}>Document verification hash</Text><Text style={styles.hash}>{signed.documentHash}</Text>
      </View>
      <Text style={styles.footer}>Audit certificate generated with the completed CyberShield Agreement.</Text>
    </Page>}
  </Document>;
}

