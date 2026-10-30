"use server";
import { redirect } from "next/navigation";
import { validateAdminCsrf } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function saveServiceTemplate(form:FormData){
 await validateAdminCsrf(String(form.get("csrfToken")||""));
 const service=String(form.get("service")||"");
 const intro=String(form.get("intro")||"").trim();
 if(!["NETWORK_SECURITY","IDENTITY_IP_PROTECTOR"].includes(service)||intro.length>1500) redirect("/admin/communications/templates?error=Invalid%20template");
 await prisma.adminAuditEvent.create({data:{action:"CUSTOMER_TEMPLATE_UPDATED",actorRole:"ADMIN",metadata:{service,intro,version:new Date().toISOString()}}});
 redirect("/admin/communications/templates?success=Template%20saved");
}

export async function saveFirewallTemplate(form:FormData){
 await validateAdminCsrf(String(form.get("csrfToken")||""));
 const subject=String(form.get("subject")||"").trim(),html=String(form.get("html")||"");
 const {validateFirewallHtml}=await import("@/lib/firewall-template-settings");
 if(!subject||subject.length>180||/[\r\n]/.test(subject)||!validateFirewallHtml(html))redirect("/admin/communications/templates?error=Invalid%20Firewall%20template");
 await prisma.adminAuditEvent.create({data:{action:"FIREWALL_TEMPLATE_UPDATED",actorRole:"ADMIN",metadata:{subject,html,version:new Date().toISOString()}}});
 redirect("/admin/communications/templates?success=Firewall%20template%20saved");
}

export async function saveServiceHtml(form:FormData){
 await validateAdminCsrf(String(form.get("csrfToken")||""));
 const service=String(form.get("service")||""),html=String(form.get("html")||"");
 const {validateFirewallHtml}=await import("@/lib/firewall-template-settings");
 if(!["NETWORK_SECURITY","IDENTITY_IP_PROTECTOR"].includes(service)||!validateFirewallHtml(html))redirect("/admin/communications/templates?error=Invalid%20service%20HTML");
 await prisma.adminAuditEvent.create({data:{action:"SERVICE_HTML_UPDATED",actorRole:"ADMIN",metadata:{service,html,version:new Date().toISOString()}}});
 redirect("/admin/communications/templates?success=Service%20HTML%20saved");
}
