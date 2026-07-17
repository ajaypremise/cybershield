"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/auth";
import { safeSecretEqual } from "@/lib/crypto";
import { env } from "@/lib/env";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requestContext } from "@/lib/request";
import { loginSchema } from "@/lib/validation";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const context = await requestContext();
  await enforceRateLimit("admin-login", context.ip, 8, 15 * 60);
  if (!parsed.success || !safeSecretEqual(parsed.data.password, env("ADMIN_PASSWORD"))) redirect("/admin/login?error=Invalid%20password");
  await createAdminSession();
  redirect("/email");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

