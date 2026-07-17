import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { adminLoginAction } from "./actions";
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { if (await getAdminSession()) redirect("/admin"); const { error } = await searchParams; return <main className="sign-root"><div className="sign-shell"><div className="sign-brand"><Image src="/cybershield-logo.png" alt="CyberShield" width={210} height={54} /></div><section className="sign-error-card"><p className="internal-eyebrow">Owner access</p><h1>Administrator portal</h1><p>Full customer history, reporting and audit access.</p>{error && <div className="sign-alert">{error}</div>}<form action={adminLoginAction} className="internal-form"><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><button className="internal-primary" type="submit">Sign in</button></form></section></div></main>; }

