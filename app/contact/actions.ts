"use server";
import { redirect } from "next/navigation";
import { auditEvent } from "@/lib/audit";
import { sendContactSubmission } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { contactSchema, normalizeEmail } from "@/lib/validation";
export async function contactAction(formData: FormData) {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/contact?status=invalid");
  if (parsed.data.website) redirect("/contact?status=received");
  const { ip } = await requestContext();
  await enforceRateLimit("public-contact", `${ip}:${normalizeEmail(parsed.data.email)}`, 4, 60 * 60);
  try { await sendContactSubmission(parsed.data); await auditEvent({ action: "PUBLIC_CONTACT_SENT", actorRole: "SYSTEM", ipAddress: ip }); }
  catch (error) { console.error("Contact form delivery failed", error instanceof Error ? error.message : "Unknown error"); await auditEvent({ action: "PUBLIC_CONTACT_FAILED", actorRole: "SYSTEM", ipAddress: ip, success: false }); }
  redirect("/contact?status=received");
}
