import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/crypto";

export const ADMIN_COOKIE = "cybershield_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

export async function createAdminSession(): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await prisma.adminSession.create({ data: { tokenHash: sha256(token), csrfToken, expiresAt } });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({ where: { tokenHash: sha256(token) } });
  if (!session || session.expiresAt <= new Date()) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function validateCsrf(supplied: string): Promise<void> {
  const session = await requireAdmin();
  if (sha256(supplied) !== sha256(session.csrfToken)) throw new Error("Invalid request token");
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(ADMIN_COOKIE);
}

