import { randomUUID } from "node:crypto";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAest, formatAud } from "@/lib/format";
import { InternalShell } from "@/components/internal/InternalShell";
import { ConfirmButton } from "@/components/internal/ConfirmButton";
import { resendPurchaseConfirmationAction, sendPurchaseConfirmationAction } from "@/app/email/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Purchase confirmations", robots: { index: false, follow: false } };

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ q?: string; customer?: string; sent?: string; resent?: string; error?: string }> }) {
  const session = await requireAdmin(); const params = await searchParams; const q = params.q?.trim() || "";
  const customers = q ? await prisma.customer.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { customerId: { contains: q, mode: "insensitive" } }, { normalizedEmail: { contains: q.toLowerCase() } }] }, take: 8, orderBy: { updatedAt: "desc" } }) : [];
  const selected = params.customer ? await prisma.customer.findUnique({ where: { id: params.customer } }) : null;
  const recent = await prisma.purchase.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 12 });
  const sentPurchase = params.sent ? await prisma.purchase.findUnique({ where: { id: params.sent }, include: { customer: true } }) : null;
  return <InternalShell title="Purchase confirmations" eyebrow="Customer operations">
    <p className="internal-lead">Create a permanent customer record, save the purchase, and send a branded confirmation with the contact-information PDF.</p>
    {params.error && <div className="internal-alert error" role="alert">{params.error}</div>}
    {sentPurchase && <div className="internal-alert success"><strong>{params.resent ? "Confirmation resent" : "Confirmation sent"}</strong><span>Customer ID {sentPurchase.customer.customerId} · Resend ID {sentPurchase.resendEmailId || "pending"}</span><Link href={`/agreement?purchase=${sentPurchase.id}`}>Create Agreement →</Link></div>}
    <section className="internal-grid">
      <div className="internal-card p-6 sm:p-8"><h2>Find an existing customer</h2><form className="internal-form mt-5" method="get"><label htmlFor="q">Name, customer ID or email</label><div className="flex gap-3"><input id="q" name="q" defaultValue={q} placeholder="Search customers" /><button className="internal-secondary" type="submit">Search</button></div></form>
        {customers.length > 0 && <div className="internal-search-results">{customers.map((customer) => <Link key={customer.id} href={`/email?customer=${customer.id}`}><strong>{customer.name}</strong><span>{customer.customerId} · {customer.email}</span></Link>)}</div>}
      </div>
      <div className="internal-card p-6 sm:p-8"><h2>Send purchase confirmation</h2><p className="mt-2 text-sm text-slate-400">{selected ? <>Existing customer: <strong className="text-cyan">{selected.customerId}</strong></> : "A secure permanent customer ID will be assigned when sent."}</p>
        <form action={sendPurchaseConfirmationAction} className="internal-form mt-6"><input type="hidden" name="submissionKey" value={randomUUID()} /><input type="hidden" name="csrfToken" value={session.csrfToken} />
          <label htmlFor="customerName">Customer name</label><input id="customerName" name="customerName" required maxLength={160} defaultValue={selected?.name || ""} />
          <label htmlFor="customerEmail">Customer email</label><input id="customerEmail" name="customerEmail" type="email" required maxLength={320} defaultValue={selected?.email || ""} />
          <div className="internal-form-grid"><div><label htmlFor="tenure">Protection tenure</label><input id="tenure" name="tenure" required maxLength={120} placeholder="e.g. 24 months" /></div><div><label htmlFor="amountPaid">Amount paid in AUD</label><input id="amountPaid" name="amountPaid" inputMode="decimal" required placeholder="0.00" /></div></div>
          <label htmlFor="agentName">Agent name</label><input id="agentName" name="agentName" required maxLength={160} />
          <ConfirmButton message="Confirm these purchase details and send the customer email?">Save and send confirmation</ConfirmButton>
        </form>
      </div>
    </section>
    <section className="internal-card mt-8 overflow-hidden"><div className="internal-section-heading"><h2>Recent confirmations</h2><span>{recent.length} records</span></div><div className="internal-table-wrap"><table className="internal-table"><thead><tr><th>Customer</th><th>Package</th><th>Status</th><th>Sent</th><th>Actions</th></tr></thead><tbody>{recent.map((purchase) => <tr key={purchase.id}><td><strong>{purchase.customer.name}</strong><span>{purchase.customer.customerId}<br />{purchase.customer.email}</span></td><td>{purchase.tenure}<span>{formatAud(purchase.amountPaid)} · {purchase.agentName}</span></td><td><span className={`status-chip ${purchase.status.toLowerCase()}`}>{purchase.status.replaceAll("_", " ")}</span></td><td>{purchase.confirmationSentAt ? formatAest(purchase.confirmationSentAt) : "—"}</td><td><div className="table-actions"><form action={resendPurchaseConfirmationAction}><input type="hidden" name="purchaseId" value={purchase.id} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><ConfirmButton className="link-button" message={`Resend this confirmation to ${purchase.customer.email}?`}>Resend</ConfirmButton></form><Link href={`/agreement?purchase=${purchase.id}`}>Agreement</Link></div></td></tr>)}</tbody></table></div></section>
  </InternalShell>;
}

