"use server";
import { redirect } from "next/navigation";
import { validateAdminCsrf } from "@/lib/auth";
import { auditEvent } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { requestContext } from "@/lib/request";
import { adminCustomerSchema, normalizeEmail, normalizePhone, noteSchema } from "@/lib/validation";

export async function updateCustomerAction(formData: FormData) {
  const parsed = adminCustomerSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) redirect(`/admin/customers/${formData.get("customerId")}?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid details")}`);
  await validateAdminCsrf(parsed.data.csrfToken); const { ip } = await requestContext(); const name = [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(" ");
  await prisma.customer.update({ where: { id: parsed.data.customerId }, data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, name, email: parsed.data.email, normalizedEmail: normalizeEmail(parsed.data.email), phone: parsed.data.phone, normalizedPhone: parsed.data.phone ? normalizePhone(parsed.data.phone) || null : null, alternatePhone: parsed.data.alternatePhone, address: parsed.data.address, lastActionAgentName: parsed.data.agentName } });
  await auditEvent({ action: "ADMIN_CUSTOMER_UPDATED", targetId: parsed.data.customerId, actorRole: "ADMIN", actorName: parsed.data.agentName, ipAddress: ip }); redirect(`/admin/customers/${parsed.data.customerId}?success=Customer%20updated`);
}
export async function addAdminNoteAction(formData: FormData) {
  const parsed = noteSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success || !parsed.data.customerId) redirect(`/admin/customers/${formData.get("customerId")}?error=Invalid%20note`);
  await validateAdminCsrf(parsed.data.csrfToken); const { ip } = await requestContext(); await prisma.internalNote.create({ data: { customerId: parsed.data.customerId, noteText: parsed.data.noteText, agentName: parsed.data.agentName, source: "ADMIN" } }); await auditEvent({ action: "ADMIN_NOTE_ADDED", targetId: parsed.data.customerId, actorRole: "ADMIN", actorName: parsed.data.agentName, ipAddress: ip }); redirect(`/admin/customers/${parsed.data.customerId}?success=Note%20added`);
}

