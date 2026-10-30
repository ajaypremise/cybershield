import { prisma } from "@/lib/db";
import { firewallSubject, firewallText } from "@/lib/customer-communications";
export const DEFAULT_FIREWALL_HTML = "<!DOCTYPE html><html lang=\"en-AU\"><head><meta charset=\"UTF-8\"></head><body style=\"margin:0;background:#071326;font-family:Arial,Helvetica,sans-serif;color:#222\"><div style=\"max-width:640px;margin:0 auto;padding:28px 12px\"><div style=\"background:#0b1c35;border-top:5px solid #39c9f6;padding:24px 28px\"><img src=\"https://www.cybershieldau.com.au/cybershield-logo.png\" alt=\"CyberShield\" width=\"190\" style=\"display:block;max-width:100%\"></div><div style=\"background:#fff;padding:30px 28px\"><p style=\"color:#089bc5;font-weight:700;letter-spacing:2px;font-size:12px\">CUSTOMER SECURITY UPDATE · FIREWALL 6.0</p><h1 style=\"color:#0b1c35;font-size:29px;line-height:36px\">Your security deserves an updated review.</h1><p>Dear {{customerName}},</p><p>CyberShield Firewall 6.0 is available for review for eligible customers. It introduces updated security configuration options designed for modern devices, networks and changing online risks.</p><div style=\"background:#eef9fd;border-left:4px solid #39c9f6;padding:16px 20px\"><p style=\"font-weight:700;color:#0b1c35\">What a Firewall 6.0 review can help with</p><p>✓ Smarter filtering of suspicious connections and unsafe websites</p><p>✓ Security settings for connected devices and home networks</p><p>✓ Updated privacy and network configuration options</p><p>✓ A review of compatibility with your current setup</p></div><h2 style=\"font-size:20px;color:#0b1c35\">Request your upgrade review</h2><p>Speak to our team to check whether Firewall 6.0 is suitable for your existing service and devices.</p><div style=\"text-align:center;padding:16px 0\"><a href=\"tel:1800997002\" style=\"display:inline-block;background:#0b1c35;color:#fff;padding:15px 25px;border-radius:8px;font-weight:700;text-decoration:none\">Call 1800 997 002</a></div><p style=\"text-align:center;font-weight:700;color:#0b1c35\">Prefer a callback? Simply reply YES to this email.</p><p style=\"font-size:13px;color:#596579\">Customer ID: {{customerId}}. Suitability depends on your current devices, network and service. No changes will be made without discussing them with you. This message does not confirm an upgrade, extend existing coverage or request payment.</p><p>CyberShield Customer Protection Team</p></div><div style=\"background:#0b1c35;padding:20px 28px;color:#ddd;font-size:12px;line-height:20px\"><p>CyberShield · 121 Collins Street, Melbourne VIC 3000<br>1800 997 002 · (03) 7046 5922 · info@cybershieldau.com.au</p><hr style=\"border:0;border-top:1px solid #333;margin:18px 0\"><p style=\"color:#aaa;font-size:11px\">This transactional message relates to your CyberShield service.</p></div></div></body></html>";

type Template = {subject:string; html:string; version:string};
export function validateFirewallHtml(html:string):boolean {
 if(!html.trim()||html.length>25000)return false;
 if(/<\s*\/?\s*(script|iframe|object|embed|form|input|button|meta|base|svg|math|style|link)\b/i.test(html))return false;
 if(/\bon[a-z]+\s*=/i.test(html)||/javascript\s*:|data\s*:|vbscript\s*:/i.test(html))return false;
 if(/<\s*img\b/i.test(html)){const images=html.match(/<img\b[^>]*>/gi)||[];if(images.some(tag=>!/^<img\s+src="https:\/\/www\.cybershieldau\.com\.au\/cybershield-logo\.png"\s+alt="CyberShield"\s+width="190"\s+style="display:block;max-width:100%"\s*>$/i.test(tag)))return false;}
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
export function firewallPlainText(details:{customerName:string;customerId:string},html?:string){
 if(!html)return firewallText(details);
 return renderFirewallHtml(html,details)
  .replace(/<\s*br\s*\/?>/gi,"\n")
  .replace(/<\/\s*(p|div|h[1-6]|li)\s*>/gi,"\n")
  .replace(/<[^>]*>/g," ")
  .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'")
  .replace(/[ \t]+/g," ").replace(/\n\s*\n\s*\n/g,"\n\n").trim();
}
