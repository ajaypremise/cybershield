import sharp from "sharp";
import { z } from "zod";

const trimmed = (max: number) => z.string().trim().min(1).max(max);

export const purchaseInputSchema = z.object({
  customerName: trimmed(160), customerEmail: z.string().trim().email().max(320), tenure: trimmed(120),
  amountPaid: z.string().trim().regex(/^\d{1,9}(?:\.\d{1,2})?$/, "Enter a valid AUD amount").refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  agentName: trimmed(160), submissionKey: z.string().uuid(), csrfToken: z.string().length(64),
});

export const agreementCreateSchema = z.object({ purchaseId: z.string().uuid(), csrfToken: z.string().length(64) });
export const agreementActionSchema = z.object({ agreementId: z.string().uuid(), csrfToken: z.string().length(64) });
export const signAgreementSchema = z.object({ token: z.string().min(40).max(200), typedSignerName: trimmed(160), consent: z.literal("on"), consentText: trimmed(1000), signatureDataUrl: z.string().max(700_000) });
export const loginSchema = z.object({ password: z.string().min(1).max(1024) });

export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }

export function decodeSignature(dataUrl: string, maxBytes = 500_000): Buffer {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl); if (!match) throw new Error("Signature must be a PNG image");
  const buffer = Buffer.from(match[1], "base64"); if (buffer.length < 150) throw new Error("Please draw a signature before submitting"); if (buffer.length > maxBytes) throw new Error("Signature image is too large");
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("Invalid signature image"); return buffer;
}

export async function validateSignatureImage(buffer: Buffer): Promise<void> {
  const image = sharp(buffer, { limitInputPixels: 3_000_000, failOn: "warning" }); const metadata = await image.metadata();
  if (metadata.format !== "png" || !metadata.width || !metadata.height) throw new Error("Invalid signature image");
  if (metadata.width < 100 || metadata.height < 50 || metadata.width > 2400 || metadata.height > 1200) throw new Error("Signature image dimensions are not allowed");
  const { data, info } = await image.flatten({ background: "#ffffff" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let inkPixels = 0; for (const value of data) if (value < 245) inkPixels += 1;
  if (inkPixels < Math.max(30, Math.floor(info.width * info.height * 0.0001))) throw new Error("Please draw a signature before submitting");
}

