import { Resend } from "resend";
import { env } from "@/lib/env";
import { PurchaseConfirmationEmail, purchaseConfirmationText, type PurchaseEmailProps } from "@/components/email/PurchaseConfirmationEmail";
import { SigningRequestEmail, signingRequestText, type SigningEmailProps } from "@/components/email/SigningRequestEmail";
import { SignedAgreementEmail } from "@/components/email/SignedAgreementEmail";

function client() { return new Resend(env("RESEND_API_KEY")); }
type Failure = { name: string; message: string; statusCode?: number };

export class EmailDeliveryError extends Error {
  statusCode?: number;
  constructor(error: Failure) { super(error.message); this.name = error.name; this.statusCode = error.statusCode; }
}
export class CompletedAgreementDeliveryError extends Error {
  constructor(readonly customerId: string | null, readonly internalId: string | null) { super("One or more signed agreement emails could not be sent"); }
}

function details(error: unknown): Failure {
  const item = error && typeof error === "object" ? error as { name?: unknown; message?: unknown; statusCode?: unknown } : {};
  return { name: typeof item.name === "string" ? item.name : "ResendError", message: typeof item.message === "string" ? item.message : "Email provider did not return a message ID", statusCode: typeof item.statusCode === "number" ? item.statusCode : undefined };
}

async function sendEmail(operation: string, input: Parameters<Resend["emails"]["send"]>[0]) {
  try {
    const { data, error } = await client().emails.send(input);
    if (error || !data?.id) {
      const failure = details(error);
      console.error("Resend email send failed", { operation, error: failure });
      throw new EmailDeliveryError(failure);
    }
    console.info("Resend email sent", { operation, emailId: data.id });
    return data.id;
  } catch (error) {
    if (error instanceof EmailDeliveryError) throw error;
    const failure = details(error);
    console.error("Resend email send failed", { operation, error: failure });
    throw new EmailDeliveryError(failure);
  }
}

export function sendPurchaseConfirmation(to: string, props: PurchaseEmailProps, pdf: Buffer) {
  return sendEmail("purchase_confirmation", { from: env("RESEND_FROM_EMAIL"), to, subject: `CyberShield confirmation — ${props.customerId}`, react: <PurchaseConfirmationEmail {...props} />, text: purchaseConfirmationText(props), attachments: [{ filename: "CyberShield-Confirmation.pdf", content: pdf }] });
}
export function sendSigningRequest(to: string, props: SigningEmailProps) {
  return sendEmail("agreement_invitation", { from: env("RESEND_FROM_EMAIL"), to, subject: "Action required: Review and sign your CyberShield Agreement", react: <SigningRequestEmail {...props} />, text: signingRequestText(props) });
}
export async function sendCompletedAgreement(input: { customerEmail: string; customerName: string; agreementNumber: string; pdf: Buffer }) {
  const attachments = [{ filename: `CyberShield-Agreement-${input.agreementNumber}.pdf`, content: input.pdf }];
  const [customer, internal] = await Promise.allSettled([
    sendEmail("signed_agreement_customer", { from: env("RESEND_FROM_EMAIL"), to: input.customerEmail, subject: `Your signed CyberShield Agreement — ${input.agreementNumber}`, react: <SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} />, text: `Your signed CyberShield Agreement ${input.agreementNumber} is attached.`, attachments }),
    sendEmail("signed_agreement_internal", { from: env("RESEND_FROM_EMAIL"), to: env("CYBERSHIELD_INTERNAL_EMAIL"), subject: `CyberShield Agreement Signed — ${input.agreementNumber}`, react: <SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} internal />, text: `Agreement ${input.agreementNumber} has been signed.`, attachments }),
  ]);
  const customerId = customer.status === "fulfilled" ? customer.value : null;
  const internalId = internal.status === "fulfilled" ? internal.value : null;
  if (!customerId || !internalId) throw new CompletedAgreementDeliveryError(customerId, internalId);
  return { customerId, internalId };
}
