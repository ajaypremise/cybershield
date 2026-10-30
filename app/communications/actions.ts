"use server";
import { createElement } from "react";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { validateAdminCsrf, validateAgentCsrf } from "@/lib/auth";
import { createPortalToken, verifyPortalToken } from "@/lib/portal-token";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { SERVICES, formatMoney } from "@/lib/services";
import { CustomerCommunicationEmail, customerCommunicationText, customerCommunicationSubject, type CommunicationDetails } from "@/lib/customer-communications";
import type { ServiceType } from "@prisma/client";

const route=(role:string)=>role==="admin"?"/admin/communications":"/portal";
function fail(role:string,message:string):never {redirect(`${route(role)}?error=${encodeURIComponent(message)}`);}
export async function sendCustomerCommunication(form:FormData) {
 const role=String(form.get("role")||"");
 if(role!=="admin"&&role!=="agent") throw new Error("Invalid role");
 const csrf=String(form.get("csrfToken")||"");
 const session=role==="admin"?await validateAdminCsrf(csrf):await validateAgentCsrf(csrf);
 const customerId=String(form.get("customerId")||"");
 const token=String(form.get("recordToken")||"");
 if(role==="agent"){
   const verified=verifyPortalToken(token,session.id,"record");
   if(!verified||verified.customerId!==customerId) fail(role,"Customer access expired. Look up the customer again.");
 }
 const customer=await prisma.customer.findUnique({where:{id:customerId}});
 if(!customer) fail(role,"Customer not found.");
 const service=String(form.get("service")||"") as ServiceType;
 if(service!=="NETWORK_SECURITY"&&service!=="IDENTITY_IP_PROTECTOR") fail(role,"Choose an approved service.");
 const years=Number(form.get("years"));
 const amount=Number(form.get("amount"));
 const message=String(form.get("message")||"").trim();
 if(!Number.isInteger(years)||years<1||years>50||!Number.isFinite(amount)||amount<=0||amount>10000000||message.length>2000) fail(role,"Check years, amount and message length.");
 const currency=String(form.get("currency")||"AUD");
 if(!["AUD","USD","GBP"].includes(currency)) fail(role,"Invalid currency.");
 const idempotencyKey=String(form.get("idempotencyKey")||"");
 if(!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) fail(role,"Invalid request.");
 const request=await requestContext();
 await enforceRateLimit("customer-communication",`${role}:${session.id}:${request.ip}`,10,3600);
 // Reserve the unique request before contacting the provider. Never retry the same request automatically.
 const existing=await prisma.adminAuditEvent.findFirst({where:{action:"CUSTOMER_EMAIL_REQUEST",metadata:{path:["requestId"],equals:idempotencyKey}}});
 if(existing) fail(role,"This request was already submitted. Review history before trying again.");
 const templateEvents=await prisma.adminAuditEvent.findMany({where:{action:"CUSTOMER_TEMPLATE_UPDATED"},orderBy:{timestamp:"desc"},take:100});
 const template=templateEvents.find(e=>(e.metadata as {service?:string}|null)?.service===service);
 const intro=(template?.metadata as {intro?:string}|null)?.intro||"";
 const details:CommunicationDetails={intro,customerName:customer.name,customerId:customer.customerId,service,years,amount:formatMoney({toString:()=>amount.toFixed(2)},currency),message};
 const file=form.get("attachment");
 let attachments: {filename:string;content:Buffer}[]=[];
 if(file instanceof File && file.size>0){
   if(file.size>5*1024*1024) fail(role,"Attachment must be 5 MB or less.");
   const filename=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,100);
   const bytes=Buffer.from(await file.arrayBuffer());
   const pdf=filename.toLowerCase().endsWith(".pdf")&&bytes.subarray(0,5).toString()==="%PDF-";
   const png=filename.toLowerCase().endsWith(".png")&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
   const jpg=/\.jpe?g$/i.test(filename)&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   if(!pdf&&!png&&!jpg) fail(role,"Only valid PDF, PNG or JPEG attachments are allowed.");
   attachments=[{filename,content:bytes}];
 }
 await prisma.adminAuditEvent.create({data:{action:"CUSTOMER_EMAIL_REQUEST",targetId:customer.id,actorRole:role.toUpperCase(),actorName:role==="admin"?"Administrator":"Agent",ipAddress:request.ip,metadata:{requestId:idempotencyKey,customerId:customer.customerId,service,years,amount,currency,attachment:attachments[0]?.filename||null,status:"ATTEMPTED",intro,message}}});
 let providerId:string;
 try {
   const {data,error}=await new Resend(env("RESEND_API_KEY")).emails.send({
     from:env("RESEND_FROM_EMAIL"),to:customer.email,subject:customerCommunicationSubject(details),
     react:createElement(CustomerCommunicationEmail,{details}),text:customerCommunicationText(details),
     ...(attachments.length?{attachments}:{})
   });
   if(error||!data?.id) throw new Error("Email provider rejected the request.");
   providerId=data.id;
 } catch {
   await prisma.adminAuditEvent.create({data:{action:"CUSTOMER_EMAIL_FAILED",targetId:customer.id,actorRole:role.toUpperCase(),metadata:{requestId:idempotencyKey,service}}});
   fail(role,"Email could not be sent. Check communication history before retrying.");
 }
 try {
   await prisma.adminAuditEvent.create({data:{action:"CUSTOMER_EMAIL_ACCEPTED",targetId:customer.id,actorRole:role.toUpperCase(),metadata:{requestId:idempotencyKey,providerId,service,attachment:attachments[0]?.filename||null}}});
 } catch {
   fail(role,"Provider accepted the email, but history could not be updated. Do not resend until checked.");
 }
 redirect(`${route(role)}?success=${encodeURIComponent("Email accepted by provider for "+customer.customerId+". Delivery is not yet confirmed.")}`);
}
