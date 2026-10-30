import Link from "next/link";
import { ServiceHtmlView } from "@/components/internal/ServiceHtmlView";
import { SERVICES } from "@/lib/services";
import { requireAdmin } from "@/lib/auth";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "@/app/admin/login/actions";
import { saveFirewallTemplate } from "./actions";
import { getFirewallTemplate } from "@/lib/firewall-template-settings";
import {getServiceHtmlOverride} from "@/lib/service-html-overrides";
export default async function TemplatePage({searchParams}:{searchParams:Promise<{success?:string;error?:string}>}){
 const session=await requireAdmin();const params=await searchParams;const firewall=await getFirewallTemplate();
 const services=[{id:"NETWORK_SECURITY",name:"Network Security"},{id:"IDENTITY_IP_PROTECTOR",name:"Identity & IP Protector"}] as const;
 const overrides=await Promise.all(services.map(s=>getServiceHtmlOverride(s.id)));
 return <InternalShell role="Administrator" logoutAction={adminLogoutAction}>
 <Link href="/admin/communications">← Communications</Link><p className="internal-eyebrow">Administrator only</p><h1>Service email templates</h1>
 <p className="internal-lead">View the complete HTML of each outgoing email, edit and save a replacement for future emails. Historical customer emails are not changed.</p>
 {params.success&&<div className="internal-alert success">{params.success}</div>}{params.error&&<div className="internal-alert error">{params.error}</div>}
 <section className="internal-card" style={{padding:"1.5rem",marginTop:20}}><h2>Firewall 6.0 upgrade email</h2><p>Admin-only. Changes apply to subsequent sends, not previously sent emails. Use customer-name and customer-ID placeholders as documented in the default HTML. HTML is reviewed for dangerous elements before saving.</p><form action={saveFirewallTemplate} className="internal-form"><input type="hidden" name="csrfToken" value={session.csrfToken}/><label>Subject<input name="subject" defaultValue={firewall.subject} maxLength={180} required/></label><label>Email HTML<textarea name="html" defaultValue={firewall.html} rows={20} required style={{fontFamily:"monospace"}}/></label><button className="internal-primary">Save Firewall 6.0 template</button></form><p>Version: {firewall.version}</p></section>
 {services.map(s=>{return <section key={s.id} className="internal-card" style={{padding:"1.5rem",marginTop:20}}>
 <h2>{s.name}</h2><ServiceHtmlView serviceName={SERVICES[s.id].name} service={s.id} csrfToken={session.csrfToken} override={overrides.find((_v,i)=>services[i].id===s.id)}/>
</section>;})}
 </InternalShell>;
}
