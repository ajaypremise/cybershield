import { Resend } from "resend";
import { env } from "@/lib/env";
import { PurchaseConfirmationEmail, purchaseConfirmationText, type PurchaseEmailProps } from "@/components/email/PurchaseConfirmationEmail";
import { SigningRequestEmail, signingRequestText, type SigningEmailProps } from "@/components/email/SigningRequestEmail";
import { SignedAgreementEmail } from "@/components/email/SignedAgreementEmail";

function client() { return new Resend(env("RESEND_API_KEY")); }

type ResendFailureDetails = { name: string; message: string; statusCode: number | undefined };

export class EmailDeliveryError extends Error {
  readonly statusCode: number | undefined;

  constructor(details: ResendFailureDetails) {
    super(details.message);
    this.name = details.name;
    this.statusCode = details.statusCode;
  }
}

export class CompletedAgreementDeliveryError extends Error {
  readonly customerId: string | null;
  readonly internalId: string | null;

  constructor(customerId: string | null, internalId: string | null) {
    super("One or more signed agreement emails could not be sent");
    this.name = "CompletedAgreementDeliveryError";
    this.customerId = customerId;
    this.internalId = internalId;
  }
}

function failureDetails(error: unknown, fallback = "Email provider did not return a message ID"): ResendFailureDetails {
  if (error && typeof error === "object") {
    const candidate = error as { name?: unknown; message?: unknown; statusCode?: unknown };
    return {
      name: typeof candidate.name === "string" ? candidate.name : "ResendError",
      message: typeof candidate.message === "string" ? candidate.message : fallback,
      statusCode: typeof candidate.statusCode === "number" ? candidate.statusCode : undefined,
    };
  }
  return { name: "ResendError", message: fallback, statusCode: undefined };
}

function logResendFailure(operation: string, error: unknown): EmailDeliveryError {
  const details = failureDetails(error);
  console.error("Resend email send failed", {
    operation,
    error: { name: details.name, message: details.message, statusCode: details.statusCode },
  });
  return new EmailDeliveryError(details);
}

async function sendEmail(operation: string, input: Parameters<Resend["emails"]["send"]>[0]): Promise<string> {
  let result: Awaited<ReturnType<Resend["emails"]["send"]>>;
  try {
    result = await client().emails.send(input);
  } catch (error) {
    throw logResendFailure(operation, error);
  }

  const { data, error } = result;
  if (error || !data?.id) throw logResendFailure(operation, error);

  console.info("Resend email sent", { operation, emailId: data.id });
  return data.id;
}

export async function sendPurchaseConfirmation(to: string, props: PurchaseEmailProps, contactPdf: Buffer): Promise<string> {
  return sendEmail("purchase_confirmation", {
    from: env("RESEND_FROM_EMAIL"), to, subject: `CyberShield Protection Confirmation — Customer ID ${props.customerId}`,
    react: <PurchaseConfirmationEmail {...props} />, text: purchaseConfirmationText(props),
    attachments: [{ filename: "CyberShield-Contact-Information.pdf", content: contactPdf }],
  });
}

export async function sendSigningRequest(to: string, props: SigningEmailProps): Promise<string> {
  return sendEmail("agreement_invitation", {
    from: env("RESEND_FROM_EMAIL"), to, subject: "Action required: Review and sign your CyberShield Agreement",
    react: <SigningRequestEmail {...props} />, text: signingRequestText(props),
  });
}

export async function sendCompletedAgreement(input: { customerEmail: string; customerName: string; agreementNumber: string; pdf: Buffer }): Promise<{ customerId: string; internalId: string }> {
  const attachment = [{ filename: `CyberShield-Agreement-${input.agreementNumber}.pdf`, content: input.pdf }];
  const [customer, internal] = await Promise.allSettled([
    sendEmail("signed_agreement_customer", { from: env("RESEND_FROM_EMAIL"), to: input.customerEmail, subject: `Your signed CyberShield Agreement — ${input.agreementNumber}`, react: <SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} />, text: `Your signed CyberShield Agreement ${input.agreementNumber} is attached.`, attachments: attachment }),
    sendEmail("signed_agreement_internal", { from: env("RESEND_FROM_EMAIL"), to: env("CYBERSHIELD_INTERNAL_EMAIL"), subject: `CyberShield Agreement Signed — ${input.customerName} — ${input.agreementNumber}`, react: <SignedAgreementEmail customerName={input.customerName} agreementNumber={input.agreementNumber} internal />, text: `${input.customerName} signed agreement ${input.agreementNumber}. The PDF is attached.`, attachments: attachment }),
  ]);
  const customerId = customer.status === "fulfilled" ? customer.value : null;
  const internalId = internal.status === "fulfilled" ? internal.value : null;
  if (!customerId || !internalId) throw new CompletedAgreementDeliveryError(customerId, internalId);
  return { customerId, internalId };
}
