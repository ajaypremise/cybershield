import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/crypto";

export async function enforceRateLimit(scope: string, key: string, limit: number, windowSeconds: number): Promise<void> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000);
  const record = await prisma.rateLimit.upsert({
    where: { scope_keyHash_windowStart: { scope, keyHash: sha256(key), windowStart } },
    create: { scope, keyHash: sha256(key), windowStart, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });
  if (record.count > limit) throw new Error("Too many attempts. Please wait and try again.");
}

