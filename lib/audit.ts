import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function adminAudit(action: string, targetId: string | null, ipAddress: string, metadata?: Prisma.InputJsonValue) {
  await prisma.adminAuditEvent.create({ data: { action, targetId, ipAddress, metadata } });
}

