import { headers } from "next/headers";

export async function requestContext(): Promise<{ ip: string; userAgent: string }> {
  const values = await headers();
  const userAgent = values.get("user-agent")?.slice(0, 1000) || "unknown";
  if (process.env.VERCEL !== "1") return { ip: "unknown", userAgent };
  const forwarded = values.get("x-vercel-forwarded-for") || values.get("x-forwarded-for") || values.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim().slice(0, 64) || "unknown";
  return { ip, userAgent };
}

