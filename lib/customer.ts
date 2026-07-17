import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { randomPublicId } from "@/lib/crypto";
import { normalizeEmail } from "@/lib/validation";

export type CustomerRecord = { id: string; customerId: string; name: string; normalizedEmail: string; email: string };

export interface CustomerRepository {
  findByEmail(normalizedEmail: string): Promise<CustomerRecord | null>;
  update(id: string, data: { name: string; email: string }): Promise<CustomerRecord>;
  create(data: { customerId: string; name: string; normalizedEmail: string; email: string }): Promise<CustomerRecord>;
}

export async function getOrCreateCustomer(
  repository: CustomerRepository,
  input: { name: string; email: string },
  generateId: () => string = () => randomPublicId(),
  maxAttempts = 8,
): Promise<CustomerRecord> {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await repository.findByEmail(normalizedEmail);
  if (existing) return repository.update(existing.id, { name: input.name.trim(), email: input.email.trim() });

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await repository.create({ customerId: generateId(), name: input.name.trim(), normalizedEmail, email: input.email.trim() });
    } catch (error) {
      const raced = await repository.findByEmail(normalizedEmail);
      if (raced) return repository.update(raced.id, { name: input.name.trim(), email: input.email.trim() });
      if (attempt === maxAttempts - 1) throw error;
    }
  }
  throw new Error("Unable to allocate a customer ID");
}

const repository: CustomerRepository = {
  findByEmail: (normalizedEmail) => prisma.customer.findUnique({ where: { normalizedEmail } }),
  update: (id, data) => prisma.customer.update({ where: { id }, data }),
  create: (data) => prisma.customer.create({ data }),
};

export async function upsertCustomer(input: { name: string; email: string }): Promise<CustomerRecord> {
  try {
    return await getOrCreateCustomer(repository, input);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await prisma.customer.findUnique({ where: { normalizedEmail: normalizeEmail(input.email) } });
      if (existing) return existing;
    }
    throw error;
  }
}

