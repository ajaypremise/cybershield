import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, UsersRound, Mail, FileText, LogOut, ShieldCheck } from "lucide-react";

export function InternalShell({ role, children, logoutAction }: { role: "Agent" | "Administrator"; children: ReactNode; logoutAction: () => Promise<void> }) {
 const admin=role==="Administrator";
 const links=admin?[{href:"/admin",label:"Customers",icon:UsersRound},{href:"/admin/communications",label:"Communications",icon:Mail},{href:"/admin/communications/templates",label:"Templates",icon:FileText}]:[{href:"/portal",label:"Workspace",icon:LayoutDashboard}];
 return <div className="internal-root crm-root">
   <aside className="crm-sidebar" aria-label="Workspace navigation">
     <Link className="crm-brand" href={admin?"/admin":"/portal"}><Image src="/cybershield-logo.png" alt="CyberShield" width={164} height={46} priority /></Link>
     <div className="crm-workspace"><ShieldCheck size={17}/><span><strong>CyberShield</strong><small>{admin?"Admin workspace":"Agent workspace"}</small></span></div>
     <p className="crm-nav-caption">WORKSPACE</p>
     <nav className="crm-side-links">{links.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={18}/>{label}</Link>)}</nav>
     <div className="crm-sidebar-bottom"><span className="crm-secure"><ShieldCheck size={15}/> Secure internal access</span><form action={logoutAction}><button type="submit"><LogOut size={17}/> Sign out</button></form></div>
   </aside>
   <div className="crm-main"><header className="crm-topbar"><span>{admin?"Administration":"Agent workspace"}</span><span className="crm-topbar-status"><i/> Secure workspace</span></header><main className="internal-shell internal-content">{children}</main></div>
 </div>;
}
