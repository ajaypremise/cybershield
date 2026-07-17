import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AGREEMENT_VERSION, createAgreementSnapshot } from "@/lib/agreement/content";
import { prisma } from "@/lib/db";
import { createDownloadToken } from "@/lib/download-token";
import { formatAest, formatAud } from "@/lib/format";
import { InternalShell } from "@/components/internal/InternalShell";
import { ConfirmButton } from "@/components/internal/ConfirmButton";
import { createAgreementAction, resendAgreementAction, sendAgreementAction, voidAgreementAction } from "@/app/agreement/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agreement management", robots: { index: false, follow: false } };

export default async function AgreementPage({ searchParams }: { searchParams: Promise<{ q?: string; customer?: string; purchase?: string; agreement?: string; created?: string; sent?: string; resent?: string; voided?: string; error?: string }> }) {
  const session = await requireAdmin(); const params = await searchParams; const q = params.q?.trim() || "";
  const customers = q ? await prisma.customer.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { customerId: { contains: q, mode: "insensitive" } }, { normalizedEmail: { contains: q.toLowerCase() } }] }, take: 8, orderBy: { updatedAt: "desc" } }) : [];
  const selectedCustomer = params.customer ? await prisma.customer.findUnique({ where: { id: params.customer }, include: { purchases: { orderBy: { createdAt: "desc" } } } }) : null;
  const purchase = params.purchase ? await prisma.purchase.findUnique({ where: { id: params.purchase }, include: { customer: true } }) : null;
  const agreement = params.agreement ? await prisma.agreement.findUnique({ where: { id: params.agreement }, include: { customer: true, purchase: true, events: { orderBy: { timestamp: "desc" } } } }) : null;
  const recent = await prisma.agreement.findMany({ include: { customer: true, purchase: true }, orderBy: { createdAt: "desc" }, take: 12 });
  const preview = purchase ? createAgreementSnapshot({ agreementNumber: "Assigned when draft is created", customerId: purchase.customer.customerId, customerName: purchase.customer.name, email: purchase.customer.email, tenure: purchase.tenure, amount: formatAud(purchase.amountPaid), agentName: purchase.agentName }) : null;
  return <InternalShell title="Agreement management" eyebrow="Secure digital agreements">
    <p className="internal-lead">Create versioned agreements from recorded purchases, issue single-use signing links, and review the complete audit trail.</p>
    {params.error && <div className="internal-alert error" role="alert">{params.error}</div>}
    {(params.created || params.sent || params.resent || params.voided) && <div className="internal-alert success"><strong>{params.created ? "Draft created" : params.sent ? "Signing request sent" : params.resent ? "Replacement link sent" : "Agreement voided"}</strong></div>}

    <section className="internal-grid">
      <div className="internal-card p-6 sm:p-8"><h2>Select customer and purchase</h2><form className="internal-form mt-5" method="get"><label htmlFor="q">Name, customer ID or email</label><div className="flex gap-3"><input id="q" name="q" defaultValue={q} /><button className="internal-secondary" type="submit">Search</button></div></form>
        {customers.length > 0 && <div className="internal-search-results">{customers.map((customer) => <Link key={customer.id} href={`/agreement?customer=${customer.id}`}><strong>{customer.name}</strong><span>{customer.customerId} · {customer.email}</span></Link>)}</div>}
        {selectedCustomer && <div className="mt-6"><p className="internal-eyebrow">Purchases for {selectedCustomer.customerId}</p><div className="internal-search-results">{selectedCustomer.purchases.map((item) => <Link key={item.id} href={`/agreement?purchase=${item.id}`}><strong>{item.tenure} · {formatAud(item.amountPaid)}</strong><span>{formatAest(item.createdAt)} · {item.agentName}</span></Link>)}</div></div>}
      </div>
      <div className="internal-card p-6 sm:p-8"><h2>{purchase ? "Agreement preview" : "Choose a purchase"}</h2>{purchase ? <><div className="summary-grid"><span>Customer ID<strong>{purchase.customer.customerId}</strong></span><span>Customer<strong>{purchase.customer.name}</strong></span><span>Tenure<strong>{purchase.tenure}</strong></span><span>Amount<strong>{formatAud(purchase.amountPaid)}</strong></span></div><p className="mt-4 text-xs text-slate-500">Contract version {AGREEMENT_VERSION}. Signed agreements are immutable; changed wording must use a new version and new agreement.</p><details className="agreement-preview mt-5" open><summary>Full agreement wording</summary><pre>{preview}</pre></details><form action={createAgreementAction} className="mt-5"><input type="hidden" name="purchaseId" value={purchase.id} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><ConfirmButton message="Create this agreement draft from the displayed purchase and wording?">Create agreement draft</ConfirmButton></form></> : <p className="mt-4 text-sm leading-6 text-slate-400">Search for a customer and select one of their saved purchases. Customer and package details will populate automatically.</p>}</div>
    </section>

    {agreement && <section className="internal-card mt-8 p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="internal-eyebrow">{agreement.agreementNumber}</p><h2>{agreement.customer.name}</h2><p className="mt-2 text-sm text-slate-400">Version {agreement.agreementVersion} · {agreement.customer.customerId} · {formatAud(agreement.purchase.amountPaid)}</p></div><span className={`status-chip ${agreement.status.toLowerCase()}`}>{agreement.status}</span></div>
      <div className="table-actions mt-6">{agreement.status === "DRAFT" && <form action={sendAgreementAction}><input type="hidden" name="agreementId" value={agreement.id} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><ConfirmButton message={`Send a seven-day signing link to ${agreement.customer.email}?`}>Send signing request</ConfirmButton></form>}{["SENT", "VIEWED", "EXPIRED"].includes(agreement.status) && <form action={resendAgreementAction}><input type="hidden" name="agreementId" value={agreement.id} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><ConfirmButton message="Invalidate the current link and send a new seven-day signing link?">Resend link</ConfirmButton></form>}{agreement.status !== "SIGNED" && agreement.status !== "VOID" && <form action={voidAgreementAction}><input type="hidden" name="agreementId" value={agreement.id} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><ConfirmButton danger message="Void this agreement? Its signing link will stop working immediately.">Void agreement</ConfirmButton></form>}{agreement.status === "SIGNED" && agreement.signedPdfUrl && <a className="internal-primary" href={`/api/internal/agreements/${agreement.id}/download?token=${createDownloadToken(agreement.id)}`}>Download signed PDF</a>}</div>
      <details className="agreement-preview mt-6" open><summary>Immutable agreement snapshot</summary><pre>{agreement.agreementContentSnapshot}</pre></details>
      <h3 className="mt-7 text-lg font-semibold text-white">Audit history</h3><ol className="audit-list">{agreement.events.map((event) => <li key={event.id}><strong>{event.eventType.replaceAll("_", " ")}</strong><span>{formatAest(event.timestamp)}{event.ipAddress ? ` · ${event.ipAddress}` : ""}</span></li>)}</ol>
    </section>}

    <section className="internal-card mt-8 overflow-hidden"><div className="internal-section-heading"><h2>Recent agreements</h2><span>{recent.length} records</span></div><div className="internal-table-wrap"><table className="internal-table"><thead><tr><th>Agreement</th><th>Customer</th><th>Package</th><th>Status</th><th>Updated</th></tr></thead><tbody>{recent.map((item) => <tr key={item.id}><td><Link href={`/agreement?agreement=${item.id}`}><strong>{item.agreementNumber}</strong></Link><span>Version {item.agreementVersion}</span></td><td>{item.customer.name}<span>{item.customer.customerId}</span></td><td>{item.purchase.tenure}<span>{formatAud(item.purchase.amountPaid)}</span></td><td><span className={`status-chip ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{formatAest(item.updatedAt)}</td></tr>)}</tbody></table></div></section>
  </InternalShell>;
}

