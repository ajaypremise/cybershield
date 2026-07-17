import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeEmail, normalizePhone } from "@/lib/validation";

export type CustomerDetails = {
  firstName: string; lastName?: string; email: string; phone: string; alternatePhone?: string;
  address: string; agentName: string;
};

export function permanentCustomerId(year: number, serial: bigint | number) {
  return `CS-${year}-${String(serial).padStart(6, "0")}`;
}

export async function findExactCustomerMatch(email: string, phone: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone) || null;
  const matches = await prisma.customer.findMany({
    where: { OR: [{ normalizedEmail }, ...(normalizedPhone ? [{ normalizedPhone }] : [])] },
    take: 2,
  });
  if (matches.length > 1 && new Set(matches.map((match) => match.id)).size > 1) {
    throw new Error("The email and phone match different customers. An administrator must resolve this record.");
  }
  return matches[0] ?? null;
}

export async function createCustomer(data: CustomerDetails) {
  return prisma.$transaction(async (tx) => {
    const name = [data.firstName, data.lastName].filter(Boolean).join(" ");
    const created = await tx.customer.create({ data: {
      customerId: `PENDING-${crypto.randomUUID()}`,
      firstName: data.firstName, lastName: data.lastName, name,
      email: data.email.trim(), normalizedEmail: normalizeEmail(data.email),
      phone: data.phone.trim(), normalizedPhone: normalizePhone(data.phone) || null,
      alternatePhone: data.alternatePhone, address: data.address,
      createdByAgentName: data.agentName, lastActionAgentName: data.agentName,
    } });
    return tx.customer.update({ where: { id: created.id }, data: { customerId: permanentCustomerId(new Date().getUTCFullYear(), created.customerSerial) } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function updateMatchedCustomer(id: string, data: CustomerDetails) {
  return prisma.customer.update({ where: { id }, data: {
    firstName: data.firstName, lastName: data.lastName,
    name: [data.firstName, data.lastName].filter(Boolean).join(" "),
    email: data.email.trim(), normalizedEmail: normalizeEmail(data.email),
    phone: data.phone.trim(), normalizedPhone: normalizePhone(data.phone) || null,
    alternatePhone: data.alternatePhone, address: data.address,
    lastActionAgentName: data.agentName,
  } });
}

// Backward-compatible helper for legacy code paths.
export async function upsertCustomer(input: { name: string; email: string }) {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await prisma.customer.findUnique({ where: { normalizedEmail } });
  if (existing) return existing;
  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  return createCustomer({ firstName, lastName: rest.join(" ") || undefined, email: input.email, phone: "", address: "Not provided", agentName: "Legacy system" });
}
