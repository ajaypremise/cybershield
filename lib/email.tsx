import { Resend } from "resend";
import { env } from "@/lib/env";
import { PurchaseConfirmationEmail, purchaseConfirmationText, type PurchaseEmailProps } from "@/components/email/PurchaseConfirmationEmail";
import { SigningRequestEmail, signingRequestText, type SigningEmailProps } from "@/components/email/SigningRequestEmail";
import { SignedAgreementEmail } from "@/components/email/SignedAgreementEmail";

function client() { return new Resend(env("RESEND_API_KEY")); }

function resultId(result: Awaited<ReturnType<Resend["emails"]["send"]>>): string {
  if (result.error || !result.data?.id) throw new Error(result.error?.message || "Email provider did not return a message ID");
  return result.data.id;
}

export async function sendPurchaseConfirmation(to: string, props: PurchaseEmailProps, contactPdf: Buffer): Promise<string> {
  const result = await client().emails.send({
    from: env("RESEND_FROM_EMAIL"), to, subject: `CyberShield Protection Confirmation — Customer ID ${props.customerId}`,
    react: <PurchaseConfirmationEmail {...props} />, text: purchaseConfirmationText(props),
    attachments: [{ filename: "CyberShield-Contact-Information.pdf", content: contactPdf }],
  });
  return resultId(result);
}

export async function sendSigningRequest(to: string, props: SigningEmailProps): Promise<string> {
  const result = await client().emails.send({
    from: env("RESEND_FROM_EMAIL"), to, subject: "Action required: Review and sign your CyberShield Agreement",
    react: <SigningRequestEmail {...props} />, text: signingRequestText(props),
  });
  return resultId(result);
}

export async function sendCompletedAgreement(input: { customerEmail: string; customerName: string; agreementNumber: string; pdf: Buffer }): Promise<{ customerId: string; internalId: string }> {
  const attachment = [{ filename: `CyberShield-Agreement-${input.agreementNumber}.pdf`, content: input.pdf }];
  const [customer, internal] = await Promise.all([
    client().emails.send({ from: env("RESEND_FROM_EMAIL"), to: input.customerEmail, subject: `Your signed CyberShield Agreement — ${input.agreementNumber}`, react: <SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} />, text: `Your signed CyberShield Agreement ${input.agreementNumber} is attached.`, attachments: attachment }),
    client().emails.send({ from: env("RESEND_FROM_EMAIL"), to: env("CYBERSHIELD_INTERNAL_EMAIL"), subject: `CyberShield Agreement Signed — ${input.customerName} — ${input.agreementNumber}`, react: <SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} internal />, text: `${input.customerName} signed agreement ${input.agreementNumber}. The PDF is attached.`, attachments: attachment }),
  ]);
  return { customerId: resultId(customer), internalId: resultId(internal) };
}

