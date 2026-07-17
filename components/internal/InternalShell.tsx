import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/login/actions";

export function InternalShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return <main className="internal-root">
    <header className="internal-header"><div className="internal-shell internal-nav"><Link href="/email"><img src="/cybershield-logo.png" alt="CyberShield" /></Link><nav aria-label="Internal navigation"><Link href="/email">Confirmations</Link><Link href="/agreement">Agreements</Link><form action={logoutAction}><button type="submit">Sign out</button></form></nav></div></header>
    <div className="internal-shell internal-content"><p className="internal-eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</div>
  </main>;
}

