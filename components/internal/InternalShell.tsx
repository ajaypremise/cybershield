import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function InternalShell({ role, children, logoutAction }: { role: "Agent" | "Administrator"; children: ReactNode; logoutAction: () => Promise<void> }) {
  return <div className="internal-root"><header className="internal-header"><div className="internal-shell internal-nav">
    <Link href={role === "Agent" ? "/portal" : "/admin"}><Image src="/cybershield-logo.png" alt="CyberShield" width={210} height={54} priority /></Link>
    <nav><span>{role} portal</span>{role === "Administrator" && <Link href="/admin">Customers</Link>}<form action={logoutAction}><button type="submit">Sign out</button></form></nav>
  </div></header><main className="internal-shell internal-content">{children}</main></div>;
}

