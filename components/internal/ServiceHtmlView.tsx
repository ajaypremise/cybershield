"use client";
import {renderToStaticMarkup} from "react-dom/server";
import {PurchaseConfirmationEmail} from "@/components/email/PurchaseConfirmationEmail";
import {saveServiceHtml} from "@/app/admin/communications/templates/actions";
export function ServiceHtmlView({serviceName,service,csrfToken,override}:{serviceName:string;service:string;csrfToken:string;override?:string|null}){
 const generated=renderToStaticMarkup(<PurchaseConfirmationEmail customerName="Sample Customer" customerId="CS-SAMPLE" confirmationNumber="CS-CNF-SAMPLE" serviceName={serviceName} serviceAreas={[]} address="Sample address" saleDate="2026-10-30" coverageStart="2026-10-30" coverageDuration="12 months" amount="AUD 100.00" agentName="CyberShield Agent"/>);
 return <form action={saveServiceHtml} className="internal-form"><input type="hidden" name="csrfToken" value={csrfToken}/><input type="hidden" name="service" value={service}/><p>{override?"Customized HTML currently used for new confirmations.":"Built-in full email HTML, shown with sample values. Save to replace it for future confirmations."}</p><label>Full email HTML<textarea name="html" rows={18} required maxLength={25000} defaultValue={override||generated} style={{fontFamily:"monospace"}}/></label><button type="submit" className="internal-primary">Save complete HTML for {serviceName}</button></form>;
}
