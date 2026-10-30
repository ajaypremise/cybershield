"use server";
import {redirect} from "next/navigation";
import {Resend} from "resend";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {validateAdminCsrf,validateAgentCsrf} from "@/lib/auth";
import {verifyPortalToken} from "@/lib/portal-token";
import {enforceRateLimit} from "@/lib/rate-limit";
import {requestContext} from "@/lib/request";
import {firewallPlainText,getFirewallTemplate,renderFirewallHtml} from "@/lib/firewall-template-settings";
const route=(role:string,id?:string)=>role==="admin"&&id?`/admin/customers/${id}`:role==="admin"?"/admin/communications":"/portal";
function fail(role:string,message:string,id?:string):never{redirect(`${route(role,id)}?error=${encodeURIComponent(message)}`);}
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function sendCustomerCommunication(form:FormData){
 const role=String(form.get("role")||"");
 if(role!=="admin"&&role!=="agent")throw new Error("Invalid role");
 const session=role==="admin"?await validateAdminCsrf(String(form.get("csrfToken")||"")):await validateAgentCsrf(String(form.get("csrfToken")||""));
 const id=String(form.get("customerId")||"");
 if(role==="agent"){const token=verifyPortalToken(String(form.get("recordToken")||""),session.id,"record");if(!token||token.customerId!==id)fail(role,"Customer access expired. Find the customer again.");}
 const customer=await prisma.customer.findUnique({where:{id}});
 if(!customer)fail(role,"Customer not found.");
 if(form.get("confirmSend")!=="yes")fail(role,"Confirm the recipients and permission before sending.",id);
 const requestId=String(form.get("idempotencyKey")||"");
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))fail(role,"Invalid request ID.",id);
 let recipients:unknown;
 try{recipients=JSON.parse(String(form.get("recipients")||"[]"));}catch{fail(role,"Invalid recipient list.",id);}
 const secondary=String(form.get("secondaryEmail")||"").trim().toLowerCase();
 if(secondary&&(!emailPattern.test(secondary)||secondary.length>320))fail(role,"Invalid secondary email.",id);
 const allowed=new Set([customer.email.toLowerCase(),...customer.secondaryEmails.map(e=>e.toLowerCase()),...(secondary?[secondary]:[])]);
 if(!Array.isArray(recipients)||recipients.length<1||recipients.length>10||recipients.some(e=>typeof e!=="string"||!emailPattern.test(e)||!allowed.has(e.toLowerCase())))fail(role,"Choose valid customer email recipients.",id);
 const selected=[...new Set((recipients as string[]).map(e=>e.toLowerCase()))];
 const save=form.get("saveSecondary")==="yes";
 if(save&&!secondary)fail(role,"Enter an email to save.",id);
 const request=await requestContext();
 await enforceRateLimit("firewall-upgrade-email",`${role}:${session.id}:${request.ip}`,10,3600);
 const reserved=await prisma.$transaction(async tx=>{
 await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))::text AS lock_result`;
 const existing=await tx.adminAuditEvent.findFirst({where:{action:"CUSTOMER_EMAIL_REQUEST",metadata:{path:["requestId"],equals:requestId}}});
 if(existing)return false;
 await tx.adminAuditEvent.create({data:{action:"CUSTOMER_EMAIL_REQUEST",targetId:id,actorRole:role.toUpperCase(),actorName:role==="admin"?"Administrator":"Agent",ipAddress:request.ip,metadata:{requestId,template:"FIREWALL_6",recipients:selected,status:"ATTEMPTED"}}});
 return true;
 });
 if(!reserved)fail(role,"This email request was already submitted. Check history before trying again.",id);
 const details={customerName:customer.name,customerId:customer.customerId};
 const template=await getFirewallTemplate();
 const accepted:string[]=[];const rejected:string[]=[];
 for(const recipient of selected){
 try{const {data,error}=await new Resend(env("RESEND_API_KEY")).emails.send({from:env("RESEND_FROM_EMAIL"),to:recipient,subject:template.subject,html:renderFirewallHtml(template.html,details),text:firewallPlainText(details)});
 if(error||!data?.id)throw new Error("Provider rejected email");
 accepted.push(recipient);
 await prisma.adminAuditEvent.create({data:{action:"CUSTOMER_EMAIL_ACCEPTED",targetId:id,actorRole:role.toUpperCase(),metadata:{requestId,recipient,providerId:data.id,template:"FIREWALL_6"}}});
 }catch(error){rejected.push(recipient);await prisma.adminAuditEvent.create({data:{action:"CUSTOMER_EMAIL_FAILED",targetId:id,actorRole:role.toUpperCase(),metadata:{requestId,recipient,template:"FIREWALL_6",error:String(error).slice(0,300)}}});}
 }
 if(save&&secondary&&accepted.includes(secondary)&&secondary!==customer.email.toLowerCase()&&!customer.secondaryEmails.map(e=>e.toLowerCase()).includes(secondary)){
 try{await prisma.customer.update({where:{id},data:{secondaryEmails:{push:secondary}}});}
 catch(error){console.error("Accepted upgrade email but secondary address could not be saved",{customerId:id,requestId,error});rejected.push("secondary-email-save");}
 }
 const msg=rejected.length?`Accepted for ${accepted.length} recipient(s), failed for ${rejected.length}. Reference: ${requestId}. Check history before retrying.`:`Upgrade email accepted for ${accepted.length} recipient(s). Delivery not yet confirmed. Reference: ${requestId}.`;
 const destination=role==="agent"?"/portal?mode=upgrade&record="+encodeURIComponent(String(form.get("recordToken")||"")):route(role,id)+"?";
 redirect(destination+(role==="agent"?"&":"")+`${rejected.length?"error":"success"}=${encodeURIComponent(msg)}`);
}
