import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SERVICES } from "@/lib/services";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "@/app/admin/login/actions";

export const metadata = { title: "Customer Communications | CyberShield", robots: { index: false, follow: false } };
export default async function CommunicationsPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  await requireAdmin();
  const {q=""} = await searchParams;
  const query=q.trim().slice(0,150);
  const customers=await prisma.customer.findMany({
    where:query?{OR:[{customerId:{equals:query,mode:"insensitive"}},{email:{contains:query,mode:"insensitive"}},{name:{contains:query,mode:"insensitive"}}]}:undefined,
    orderBy:{createdAt:"desc"},take:50,
    include:{purchases:{orderBy:{createdAt:"desc"},take:3,include:{confirmationSends:{orderBy:{createdAt:"desc"},take:2}}},agreements:{orderBy:{createdAt:"desc"},take:2,include:{sends:{orderBy:{createdAt:"desc"},take:2}}}}
  });
  return <InternalShell role="Administrator" logoutAction={adminLogoutAction}>
    <p className="internal-eyebrow">Customer operations</p><h1>Send upgrade email</h1><div className="crm-quick-actions"><Link href="/admin">All customers</Link><Link href="/admin/communications/templates">Edit email subject &amp; HTML</Link></div>
    <p className="internal-lead">Find a customer below, then open the full record to send the Firewall 6.0 email, edit details and review communication history.</p>
    <form method="get" className="internal-form" style={{maxWidth:560,marginBottom:24}}>
      <label>Find customer by name, email or Customer ID<input name="q" defaultValue={query} placeholder="Name, email or CS-2026-000123"/></label>
      <button className="internal-secondary">Search customers</button>
    </form>
    <section className="internal-card" style={{padding:"1.5rem"}}>
      <h2>Matching customers · {customers.length}</h2>
      <div className="internal-table-wrap"><table className="internal-table"><thead><tr><th>Customer</th><th>Services</th><th>Recent confirmations</th><th>Agreements</th><th>Record</th></tr></thead><tbody>
      {customers.map(c=><tr key={c.id}><td><strong>{c.name}</strong><span>{c.customerId} · {c.email}</span></td>
        <td>{c.purchases.map(p=><div key={p.id}>{p.serviceType?SERVICES[p.serviceType].name:"Legacy service"} · {p.currency} {p.salesAmount.toString()}</div>)}</td>
        <td>{c.purchases.flatMap(p=>p.confirmationSends).map(s=><div key={s.id}>{s.sendType}: {s.status} · {s.createdAt.toISOString().slice(0,10)}</div>)}</td>
        <td>{c.agreements.map(g=><div key={g.id}>{g.agreementNumber}: {g.status}</div>)}</td>
        <td><Link href={`/admin/customers/${c.id}`}>Open record &amp; send email</Link></td></tr>)}
      </tbody></table></div>
    </section>
  </InternalShell>;
}
