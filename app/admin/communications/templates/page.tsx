import Link from "next/link";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PurchaseConfirmationEmail } from "@/components/email/PurchaseConfirmationEmail";
import { SERVICES } from "@/lib/services";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "@/app/admin/login/actions";
import { saveServiceTemplate,saveFirewallTemplate } from "./actions";
import { getFirewallTemplate } from "@/lib/firewall-template-settings";
export default async function TemplatePage({searchParams}:{searchParams:Promise<{success?:string;error?:string}>}){
 const session=await requireAdmin();const params=await searchParams;const firewall=await getFirewallTemplate();
 const events=await prisma.adminAuditEvent.findMany({where:{action:"CUSTOMER_TEMPLATE_UPDATED"},orderBy:{timestamp:"desc"},take:100});
 const services=[{id:"NETWORK_SECURITY",name:"Network Security"},{id:"IDENTITY_IP_PROTECTOR",name:"Identity & IP Protector"}];
 return <InternalShell role="Administrator" logoutAction={adminLogoutAction}>
 <Link href="/admin/communications">← Communications</Link><p className="internal-eyebrow">Administrator only</p><h1>Service email templates</h1>
 <p className="internal-lead">Manage the optional introductory paragraph for each approved service template. Core service descriptions, legal notices and customer IDs cannot be edited here. Every change is saved as a new version, without changing prior customer records.</p>
 {params.success&&<div className="internal-alert success">{params.success}</div>}{params.error&&<div className="internal-alert error">{params.error}</div>}
 <section className="internal-card" style={{padding:"1.5rem",marginTop:20}}><h2>Firewall 6.0 upgrade email</h2><p>Admin-only. Changes apply to subsequent sends, not previously sent emails. Use customer-name and customer-ID placeholders as documented in the default HTML. HTML is reviewed for dangerous elements before saving.</p><form action={saveFirewallTemplate} className="internal-form"><input type="hidden" name="csrfToken" value={session.csrfToken}/><label>Subject<input name="subject" defaultValue={firewall.subject} maxLength={180} required/></label><label>Email HTML<textarea name="html" defaultValue={firewall.html} rows={20} required style={{fontFamily:"monospace"}}/></label><button className="internal-primary">Save Firewall 6.0 template</button></form><p>Version: {firewall.version}</p></section>
 {services.map(s=>{const latest=events.find(e=>(e.metadata as {service?:string}|null)?.service===s.id);const metadata=latest?.metadata as {intro?:string}|undefined;return <section key={s.id} className="internal-card" style={{padding:"1.5rem",marginTop:20}}>
 <h2>{s.name}</h2><form action={saveServiceTemplate} className="internal-form">
 <input type="hidden" name="csrfToken" value={session.csrfToken}/><input type="hidden" name="service" value={s.id}/>
 <p><strong>Full current HTML (generated from the real email component):</strong> This is the actual built-in template, including all branding and details. The separate introduction box below is the only service-email edit control currently connected to sending. Replacing the full HTML requires a separately wired and validated override.</p><label>Current email HTML<textarea readOnly rows={16} style={{fontFamily:"monospace"}} value={renderToStaticMarkup(createElement(PurchaseConfirmationEmail,{customerName:"Sample Customer",customerId:"CS-SAMPLE",confirmationNumber:"CS-CNF-SAMPLE",serviceName:SERVICES[s.id as keyof typeof SERVICES].name,serviceAreas:SERVICES[s.id as keyof typeof SERVICES].areas,address:"Sample address",saleDate:"2026-10-30",coverageStart:"2026-10-30",coverageDuration:"12 months",amount:"AUD 100.00",agentName:"CyberShield Agent"}))}/></label><label>Optional approved introduction<textarea name="intro" rows={4} maxLength={1500} defaultValue={metadata?.intro||""} placeholder="Optional additional introductory wording for this service."/></label>
 <button className="internal-primary">Save new template version</button></form>
 <p>Last saved: {latest?.timestamp.toISOString()||"Default template"}</p></section>;})}
 </InternalShell>;
}
