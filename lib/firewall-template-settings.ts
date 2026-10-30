import { prisma } from "@/lib/db";
import { firewallSubject, firewallText } from "@/lib/customer-communications";
export const DEFAULT_FIREWALL_HTML = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#14233b"><h1>CyberShield Firewall 6.0</h1><p>Dear {{customerName}},</p><p>CyberShield Firewall 6.0 is available for review for eligible customers. Updated configuration options may help with suspicious connections, device security, privacy controls and modern networks.</p><p><strong>Call 1800 997 002 or reply YES</strong> to request a review.</p><p>Suitability depends on your current setup. No changes will be made without discussing them with you. This is not confirmation of an upgrade or payment.</p><p>Customer ID: {{customerId}}</p><p>CyberShield Customer Protection Team</p></div>`;
type Template = {subject:string; html:string; version:string};
export function validateFirewallHtml(html:string):boolean {
 if(!html.trim()||html.length>25000)return false;
 if(/<\s*\/?\s*(script|iframe|object|embed|form|input|button|meta|base|svg|math|style|link)\b/i.test(html))return false;
 if(/\bon[a-z]+\s*=/i.test(html)||/javascript\s*:|data\s*:|vbscript\s*:/i.test(html))return false;
 if(/<\s*img\b/i.test(html))return false;
 return true;
}
export function escapeHtml(value:string):string{return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
export function renderFirewallHtml(html:string,details:{customerName:string;customerId:string}):string{
 return html.replace(/{{customerName}}/g,escapeHtml(details.customerName)).replace(/{{customerId}}/g,escapeHtml(details.customerId));
}
export async function getFirewallTemplate():Promise<Template>{
 const event=await prisma.adminAuditEvent.findFirst({where:{action:"FIREWALL_TEMPLATE_UPDATED"},orderBy:{timestamp:"desc"}});
 const meta=event?.metadata as {subject?:unknown;html?:unknown;version?:unknown}|null;
 if(typeof meta?.subject==="string"&&typeof meta.html==="string"&&validateFirewallHtml(meta.html))return {subject:meta.subject,html:meta.html,version:String(meta.version||event?.id)};
 return {subject:firewallSubject,html:DEFAULT_FIREWALL_HTML,version:"default"};
}
export function firewallPlainText(details:{customerName:string;customerId:string}){return firewallText(details);}
