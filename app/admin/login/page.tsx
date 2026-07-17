import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { loginAction } from "@/app/admin/login/actions";

export const metadata = { title: "Internal sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/email");
  const { error } = await searchParams;
  return <main className="internal-root grid min-h-screen place-items-center px-5"><section className="internal-card w-full max-w-md p-8 sm:p-10">
    <img src="/cybershield-logo.png" alt="CyberShield" className="mb-8 h-12 w-auto" />
    <p className="internal-eyebrow">Authorised staff only</p><h1 className="text-3xl font-semibold text-white">Internal sign in</h1>
    <p className="mt-3 text-sm leading-6 text-slate-400">Enter the administrative password. Sessions expire automatically after eight hours.</p>
    {error && <div className="internal-alert error" role="alert">{error}</div>}
    <form action={loginAction} className="internal-form mt-7"><label htmlFor="password">Admin password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} /><button className="internal-primary mt-5 w-full" type="submit">Sign in securely</button></form>
  </section></main>;
}

