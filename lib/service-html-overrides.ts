import {prisma} from "@/lib/db";
import {validateFirewallHtml,escapeHtml} from "@/lib/firewall-template-settings";
export type ServiceTemplateKey="NETWORK_SECURITY"|"IDENTITY_IP_PROTECTOR";
export async function getServiceHtmlOverride(service:ServiceTemplateKey){
 const e=await prisma.adminAuditEvent.findFirst({where:{action:"SERVICE_HTML_UPDATED",metadata:{path:["service"],equals:service}},orderBy:{timestamp:"desc"}});
 const m=e?.metadata as {html?:unknown}|null;
 return typeof m?.html==="string"&&validateFirewallHtml(m.html)?m.html:null;
}
export function renderServiceHtml(html:string,fields:Record<string,string>){
 return html.replace(/{{([a-zA-Z]+)}}/g,(_match,key:string)=>escapeHtml(fields[key]||""));
}
