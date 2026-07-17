import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cybershieldau.com.au"),
  title: {
    default: "Managed Cybersecurity Services Australia | CyberShield",
    template: "%s | CyberShield",
  },
  description:
    "CyberShield protects your entire business network with layered, enterprise-grade cybersecurity—customised for every user, device, location and cloud service.",
  keywords: [
    "managed cybersecurity Australia",
    "business network security",
    "managed firewall",
    "enterprise cyber protection",
    "CyberShield Australia",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Enterprise Cyber Protection. Without the Complexity.",
    description: "Layered, continuously managed protection for your entire business network.",
    url: "/",
    siteName: "CyberShield",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Cyber Protection. Without the Complexity.",
    description: "Layered, continuously managed protection for your entire business network.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020712",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}

