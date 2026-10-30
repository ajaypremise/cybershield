"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { validateAdminCsrf } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { confirmationContent } from "@/lib/confirmation";
import { generateCustomerConfirmationPdf } from "@/lib/pdf";
import { sendPurchaseConfirmation } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";
export async function resendOriginalConfirmation(form:FormData){
 await validateAdminCsrf(String(form.get("csrfToken")||""));
 const customerId=String(form.get("customerId")||"");
 const purchaseId=String(form.get("purchaseId")||"");
 const confirmed=String(form.get("confirm")||"")==="yes";
 const back=`/admin/customers/${encodeURIComponent(customerId)}`;
 if(!confirmed) redirect(`${back}?error=Confirm%20the%20resend`);
 const purchase=await prisma.purchase.findFirst({where:{id:purchaseId,customerId},include:{customer:true}});
 if(!purchase||purchase.legacyReviewRequired||!purchase.confirmationNumber||!purchase.serviceType||!purchase.coverageType) redirect(`${back}?error=Original%20confirmation%20requires%20review`);
 await enforceRateLimit("admin-original-resend",purchase.id,3,3600);
 const recent=await prisma.confirmationSend.findFirst({where:{purchaseId:purchase.id,createdAt:{gt:new Date(Date.now()-60000)}}});
 if(recent) redirect(`${back}?error=Recent%20send%20attempt.%20Wait%20before%20resending`);
 const attempt=await prisma.confirmationSend.create({data:{customerId,purchaseId,sendType:"ADMIN_RESEND_ORIGINAL",idempotencyKey:randomUUID(),attemptedByAgentName:"Administrator"}});
 let emailId:string;
 try {
  const content=confirmationContent(purchase);
  const pdf=await generateCustomerConfirmationPdf(content.pdf);
  emailId=await sendPurchaseConfirmation(purchase.customer.email,content.email,pdf);
 } catch {
  await prisma.confirmationSend.update({where:{id:attempt.id},data:{status:"FAILED",completedAt:new Date()}});
  redirect(`${back}?error=Resend%20failed.%20Review%20history`);
 }
 try {await prisma.confirmationSend.update({where:{id:attempt.id},data:{status:"SENT",resendEmailId:emailId,completedAt:new Date()}});}catch{redirect(`${back}?error=Provider%20accepted%20email%20but%20history%20update%20failed.%20Do%20not%20resend`);}
 redirect(`${back}?success=Original%20confirmation%20accepted%20by%20email%20provider`);
}
