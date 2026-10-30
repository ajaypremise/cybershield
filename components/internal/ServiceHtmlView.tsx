"use client";
import {renderToStaticMarkup} from "react-dom/server";
import {PurchaseConfirmationEmail} from "@/components/email/PurchaseConfirmationEmail";
export function ServiceHtmlView({serviceName}:{serviceName:string}){
 const html=renderToStaticMarkup(<PurchaseConfirmationEmail customerName="Sample Customer" customerId="CS-SAMPLE" confirmationNumber="CS-CNF-SAMPLE" serviceName={serviceName} serviceAreas={[]} address="Sample address" saleDate="2026-10-30" coverageStart="2026-10-30" coverageDuration="12 months" amount="AUD 100.00" agentName="CyberShield Agent"/>);
 return <label>Current generated email HTML<textarea readOnly rows={16} value={html} style={{fontFamily:"monospace"}}/></label>;
}
