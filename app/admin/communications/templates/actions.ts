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
