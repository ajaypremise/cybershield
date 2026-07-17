import Image from "next/image";
import { redirect } from "next/navigation";
import { getAgentSession } from "@/lib/auth";
import { agentLoginAction } from "./actions";
export default async function AgentLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAgentSession()) redirect("/portal"); const { error } = await searchParams;
  return <main className="sign-root"><div className="sign-shell"><div className="sign-brand"><Image src="/cybershield-logo.png" alt="CyberShield" width={210} height={54} /></div><section className="sign-error-card"><p className="internal-eyebrow">Secure staff access</p><h1>Agent portal</h1><p>Enter the shared agent portal password. Your session expires after eight hours.</p>{error && <div className="sign-alert">{error}</div>}<form action={agentLoginAction} className="internal-form"><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><button className="internal-primary" type="submit">Sign in</button></form></section></div></main>;
}

