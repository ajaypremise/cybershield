import sharp from "sharp";
import { z } from "zod";

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) => z.string().trim().max(max).optional().transform((value) => value || undefined);
const amount = z.string().trim().regex(/^\d{1,9}(?:\.\d{1,2})?$/, "Enter a valid sales amount").refine((value) => Number(value) > 0, "Amount must be greater than zero");

export const loginSchema = z.object({ password: z.string().min(1).max(1024) });
export const portalConfirmationSchema = z.object({
  firstName: trimmed(100), lastName: optional(100), email: z.string().trim().email().max(320),
  phone: trimmed(40), alternatePhone: optional(40), address: trimmed(1000),
  salesAmount: amount, currency: z.enum(["AUD", "USD", "GBP"]),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid sale date"),
  agentName: trimmed(160), primaryIssue: trimmed(2000), serviceDetails: trimmed(4000),
  internalNotes: optional(4000), submissionKey: z.string().uuid(), idempotencyKey: z.string().uuid(),
  csrfToken: z.string().length(64), reuseToken: optional(2000),
});
export const exactLookupSchema = z.object({ query: trimmed(320), csrfToken: z.string().length(64) });
export const portalRecordActionSchema = z.object({ recordToken: trimmed(2000), agentName: trimmed(160), idempotencyKey: z.string().uuid(), csrfToken: z.string().length(64) });
export const noteSchema = z.object({ recordToken: optional(2000), customerId: optional(40), agentName: trimmed(160), noteText: trimmed(4000), csrfToken: z.string().length(64) });
export const adminCustomerSchema = z.object({ customerId: z.string().uuid(), firstName: trimmed(100), lastName: optional(100), email: z.string().trim().email().max(320), phone: optional(40), alternatePhone: optional(40), address: trimmed(1000), agentName: trimmed(160), csrfToken: z.string().length(64) });
export const adminSearchSchema = z.object({ q: z.string().trim().max(320).default(""), from: z.string().optional(), to: z.string().optional() });

// Legacy action schemas remain exported for the public signing workflow.
export const purchaseInputSchema = z.object({ customerName: trimmed(160), customerEmail: z.string().trim().email().max(320), tenure: trimmed(120), amountPaid: amount, agentName: trimmed(160), submissionKey: z.string().uuid(), csrfToken: z.string().length(64) });
export const agreementCreateSchema = z.object({ purchaseId: z.string().uuid(), csrfToken: z.string().length(64) });
export const agreementActionSchema = z.object({ agreementId: z.string().uuid(), csrfToken: z.string().length(64) });
export const signAgreementSchema = z.object({ token: z.string().min(40).max(200), typedSignerName: trimmed(160), consent: z.literal("on"), consentText: trimmed(1000), signatureDataUrl: z.string().max(700_000) });

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 ? digits : "";
}

export function decodeSignature(dataUrl: string, maxBytes = 500_000): Buffer {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Signature must be a PNG image");
  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length < 150) throw new Error("Please draw a signature before submitting");
  if (buffer.length > maxBytes) throw new Error("Signature image is too large");
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("Invalid signature image");
  return buffer;
}

export async function validateSignatureImage(buffer: Buffer): Promise<void> {
  const image = sharp(buffer, { limitInputPixels: 3_000_000, failOn: "warning" });
  const metadata = await image.metadata();
  if (metadata.format !== "png" || !metadata.width || !metadata.height) throw new Error("Invalid signature image");
  if (metadata.width < 100 || metadata.height < 50 || metadata.width > 2400 || metadata.height > 1200) throw new Error("Signature image dimensions are not allowed");
  const { data, info } = await image.flatten({ background: "#ffffff" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let inkPixels = 0;
  for (const value of data) if (value < 245) inkPixels += 1;
  if (inkPixels < Math.max(30, Math.floor(info.width * info.height * 0.0001))) throw new Error("Please draw a signature before submitting");
}

