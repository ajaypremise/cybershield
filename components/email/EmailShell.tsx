import { Body, Container, Head, Hr, Html, Img, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export function EmailShell({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="en-AU">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: "#161616", fontFamily: "Arial, Helvetica, sans-serif", color: "#222" }}>
        <Container style={{ margin: "0 auto", maxWidth: 640, padding: "28px 12px" }}>
          <Section style={{ backgroundColor: "#111", borderTop: "5px solid #f5c400", padding: "24px 28px" }}>
            <Img src="https://www.cybershieldau.com.au/cybershield-logo.png" alt="CyberShield" width="190" style={{ display: "block", maxWidth: "100%" }} />
          </Section>
          <Section style={{ backgroundColor: "#fff", padding: "30px 28px" }}>{children}</Section>
          <Section style={{ backgroundColor: "#111", padding: "20px 28px" }}>
            <Text style={{ margin: 0, color: "#ddd", fontSize: 12, lineHeight: "20px" }}>
              CyberShield · 121 Collins Street, Melbourne VIC 3000<br />
              1800 997 002 · (03) 7046 5922 · info@cybershieldau.com.au
            </Text>
            <Hr style={{ borderColor: "#333", margin: "18px 0" }} />
            <Text style={{ margin: 0, color: "#888", fontSize: 11 }}>This transactional message relates to your CyberShield service.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

