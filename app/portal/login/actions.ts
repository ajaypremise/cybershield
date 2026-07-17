"use server";
import { redirect } from "next/navigation";
import { createAgentSession, destroyAgentSession } from "@/lib/auth";
import { safeSecretEqual } from "@/lib/crypto";
import { env } from "@/lib/env";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { loginSchema } from "@/lib/validation";

export async function agentLoginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData)); const { ip } = await requestContext();
  await enforceRateLimit("agent-login", ip, 10, 15 * 60);
  if (!parsed.success || !safeSecretEqual(parsed.data.password, env("AGENT_PORTAL_PASSWORD"))) redirect("/portal/login?error=Invalid%20password");
  await createAgentSession(); redirect("/portal");
}
export async function agentLogoutAction() { await destroyAgentSession(); redirect("/portal/login"); }

