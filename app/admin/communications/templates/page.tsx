import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "@/app/admin/login/actions";
import { saveServiceTemplate } from "./actions";
export default async function TemplatePage({searchParams}:{searchParams:Promise<{success?:string;error?:string}>}){
 const session=await requireAdmin();const params=await searchParams;
 const events=await prisma.adminAuditEvent.findMany({where:{action:"CUSTOMER_TEMPLATE_UPDATED"},orderBy:{timestamp:"desc"},take:100});
 const services=[{id:"NETWORK_SECURITY",name:"Network Security"},{id:"IDENTITY_IP_PROTECTOR",name:"Identity & IP Protector"}];
 return <InternalShell role="Administrator" logoutAction={adminLogoutAction}>
 <Link href="/admin/communications">← Communications</Link><p className="internal-eyebrow">Administrator only</p><h1>Service email templates</h1>
 <p className="internal-lead">Manage the optional introductory paragraph for each approved service template. Core service descriptions, legal notices and customer IDs cannot be edited here. Every change is saved as a new version, without changing prior customer records.</p>
 {params.success&&<div className="internal-alert success">{params.success}</div>}{params.error&&<div className="internal-alert error">{params.error}</div>}
 {services.map(s=>{const latest=events.find(e=>(e.metadata as {service?:string}|null)?.service===s.id);const metadata=latest?.metadata as {intro?:string}|undefined;return <section key={s.id} className="internal-card" style={{padding:"1.5rem",marginTop:20}}>
 <h2>{s.name}</h2><form action={saveServiceTemplate} className="internal-form">
 <input type="hidden" name="csrfToken" value={session.csrfToken}/><input type="hidden" name="service" value={s.id}/>
 <label>Optional approved introduction<textarea name="intro" rows={4} maxLength={1500} defaultValue={metadata?.intro||""} placeholder="Optional additional introductory wording for this service."/></label>
 <button className="internal-primary">Save new template version</button></form>
 <p>Last saved: {latest?.timestamp.toISOString()||"Default template"}</p></section>;})}
 </InternalShell>;
}
