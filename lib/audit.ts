import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function auditEvent(input: { action: string; targetId?: string; actorRole: "AGENT" | "ADMIN" | "CUSTOMER" | "SYSTEM"; actorName?: string; ipAddress?: string; success?: boolean; metadata?: Prisma.InputJsonValue }) {
  return prisma.adminAuditEvent.create({ data: { action: input.action, targetId: input.targetId, actorRole: input.actorRole, actorName: input.actorName, ipAddress: input.ipAddress, success: input.success ?? true, metadata: input.metadata } });
}

export async function adminAudit(action: string, targetId?: string, ipAddress?: string, metadata?: Prisma.InputJsonValue) {
  return auditEvent({ action, targetId, ipAddress, metadata, actorRole: "ADMIN" });
}
