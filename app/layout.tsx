
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./brand-refresh.css";
export const metadata:Metadata={metadataBase:new URL("https://www.cybershieldau.com.au"),title:{default:"Cybersecurity Support Australia | CyberShield",template:"%s | CyberShield"},description:"Practical network, device, identity and privacy cybersecurity support for Australian homes and businesses.",robots:{index:true,follow:true}};
export const viewport:Viewport={themeColor:"#080e25",colorScheme:"dark",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){const structured={"@context":"https://schema.org","@type":"Organization",name:"CyberShield Australia",url:"https://www.cybershieldau.com.au",email:"info@cybershieldau.com.au",address:{"@type":"PostalAddress",streetAddress:"121 Collins St",addressLocality:"Melbourne",addressRegion:"VIC",postalCode:"3000",addressCountry:"AU"}};return <html lang="en-AU"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/></body></html>}
