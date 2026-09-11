import { Resend } from "resend"; import { env } from "@/lib/env"; import { PurchaseConfirmationEmail, purchaseConfirmationText, type PurchaseEmailProps } from "@/components/email/PurchaseConfirmationEmail"; import { SigningRequestEmail, signingRequestText, type SigningEmailProps } from "@/components/email/SigningRequestEmail"; import { SignedAgreementEmail } from "@/components/email/SignedAgreementEmail";
import { STAFF_EMAIL_TEMPLATES, type StaffEmailTemplateId } from "@/lib/staff-email-templates";
function client(){return new Resend(env("RESEND_API_KEY"));} type Failure={name:string;message:string;statusCode?:number};
export class EmailDeliveryError extends Error { statusCode?:number; constructor(e:Failure){super(e.message);this.name=e.name;this.statusCode=e.statusCode;} }
export class CompletedAgreementDeliveryError extends Error { constructor(readonly customerId:string|null,readonly internalId:string|null){super("One or more signed agreement emails could not be sent");} }
function details(error:unknown):Failure { const x=error&&typeof error==="object"?error as {name?:unknown;message?:unknown;statusCode?:unknown}:{}; return {name:typeof x.name==="string"?x.name:"ResendError",message:typeof x.message==="string"?x.message:"Email provider did not return a message ID",statusCode:typeof x.statusCode==="number"?x.statusCode:undefined}; }
async function sendEmail(operation:string,input:Parameters<Resend["emails"]["send"]>[0]){try{const{data,error}=await client().emails.send(input);if(error||!data?.id){const f=details(error);console.error("Resend email send failed",{operation,error:f});throw new EmailDeliveryError(f);}console.info("Resend email sent",{operation,emailId:data.id});return data.id;}catch(error){if(error instanceof EmailDeliveryError)throw error;const f=details(error);console.error("Resend email send failed",{operation,error:f});throw new EmailDeliveryError(f);}}
export function confirmationSubject(p:PurchaseEmailProps){return `Your CyberShield ${p.serviceName} Confirmation — ${p.customerId}`;}
export function sendPurchaseConfirmation(to:string,p:PurchaseEmailProps,pdf:Buffer){return sendEmail("purchase_confirmation",{from:env("RESEND_FROM_EMAIL"),to,subject:confirmationSubject(p),react:<PurchaseConfirmationEmail {...p}/>,text:purchaseConfirmationText(p),attachments:[{filename:`CyberShield-${p.confirmationNumber}.pdf`,content:pdf}]});}
export function sendSigningRequest(to:string,p:SigningEmailProps){return sendEmail("agreement_invitation",{from:env("RESEND_FROM_EMAIL"),to,subject:"Action required: Review and sign your CyberShield Agreement",react:<SigningRequestEmail {...p}/>,text:signingRequestText(p)});}
export function sendContactSubmission(p:{name:string;email:string;phone?:string;customerId?:string;topic:string;message:string}){return sendEmail("public_contact",{from:env("RESEND_FROM_EMAIL"),to:env("CONTACT_RECIPIENT_EMAIL"),replyTo:p.email,subject:`CyberShield website enquiry — ${p.topic}`,text:`Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone||"Not supplied"}\nCustomer ID: ${p.customerId||"Not supplied"}\nTopic: ${p.topic}\n\n${p.message}`});}
export async function sendCompletedAgreement(input:{customerEmail:string;customerName:string;agreementNumber:string;pdf:Buffer}){const attachments=[{filename:`CyberShield-Agreement-${input.agreementNumber}.pdf`,content:input.pdf}];const [customer,internal]=await Promise.allSettled([sendEmail("signed_agreement_customer",{from:env("RESEND_FROM_EMAIL"),to:input.customerEmail,subject:`Your signed CyberShield Agreement — ${input.agreementNumber}`,react:<SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber}/>,text:`Your signed CyberShield Agreement ${input.agreementNumber} is attached.`,attachments}),sendEmail("signed_agreement_internal",{from:env("RESEND_FROM_EMAIL"),to:env("CYBERSHIELD_INTERNAL_EMAIL"),subject:`CyberShield Agreement Signed — ${input.agreementNumber}`,react:<SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} internal/>,text:`Agreement ${input.agreementNumber} has been signed.`,attachments})]);const customerId=customer.status==="fulfilled"?customer.value:null,internalId=internal.status==="fulfilled"?internal.value:null;if(!customerId||!internalId)throw new CompletedAgreementDeliveryError(customerId,internalId);return{customerId,internalId};}
export function sendStaffTemplateEmail(
  to: string,
  templateId: StaffEmailTemplateId,
  name: string,
  company?: string
) {
  const template = STAFF_EMAIL_TEMPLATES[templateId];

  return sendEmail("staff_template_email", {
    from: env("RESEND_FROM_EMAIL"),
    to,
    subject: template.subject,
    text: template.body(name, company),
  });
}
