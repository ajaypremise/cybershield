import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/crypto";

export const ADMIN_COOKIE = "cybershield_admin_session";
export const AGENT_COOKIE = "cybershield_agent_session";
const SESSION_SECONDS = 8 * 60 * 60;

async function setCookie(name: string, token: string) {
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

function newSession() {
  return {
    token: randomBytes(32).toString("base64url"),
    csrfToken: randomBytes(32).toString("hex"),
    expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
  };
}

export async function createAdminSession(): Promise<void> {
  const session = newSession();
  await prisma.adminSession.create({ data: { tokenHash: sha256(session.token), csrfToken: session.csrfToken, expiresAt: session.expiresAt } });
  await setCookie(ADMIN_COOKIE, session.token);
}

export async function createAgentSession(): Promise<void> {
  const session = newSession();
  await prisma.agentSession.create({ data: { tokenHash: sha256(session.token), csrfToken: session.csrfToken, expiresAt: session.expiresAt } });
  await setCookie(AGENT_COOKIE, session.token);
}

async function tokenFor(name: string) { return (await cookies()).get(name)?.value; }

export async function getAdminSession() {
  const token = await tokenFor(ADMIN_COOKIE);
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({ where: { tokenHash: sha256(token) } });
  return session && session.expiresAt > new Date() ? session : null;
}

export async function getAgentSession() {
  const token = await tokenFor(AGENT_COOKIE);
  if (!token) return null;
  const session = await prisma.agentSession.findUnique({ where: { tokenHash: sha256(token) } });
  return session && session.expiresAt > new Date() ? session : null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAgent() {
  const session = await getAgentSession();
  if (!session) redirect("/portal/login");
  return session;
}

function csrfMatches(supplied: string, expected: string) {
  return supplied.length === 64 && sha256(supplied) === sha256(expected);
}

export async function validateAdminCsrf(supplied: string) {
  const session = await requireAdmin();
  if (!csrfMatches(supplied, session.csrfToken)) throw new Error("Invalid request token");
  return session;
}

export async function validateAgentCsrf(supplied: string) {
  const session = await requireAgent();
  if (!csrfMatches(supplied, session.csrfToken)) throw new Error("Invalid request token");
  return session;
}

export const validateCsrf = validateAdminCsrf;

async function destroy(cookieName: string, remove: (hash: string) => Promise<unknown>) {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await remove(sha256(token));
  jar.delete(cookieName);
}

export async function destroyAdminSession() {
  await destroy(ADMIN_COOKIE, (tokenHash) => prisma.adminSession.deleteMany({ where: { tokenHash } }));
}

export async function destroyAgentSession() {
  await destroy(AGENT_COOKIE, (tokenHash) => prisma.agentSession.deleteMany({ where: { tokenHash } }));
}

