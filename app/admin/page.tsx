
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "./login/actions";

type Params = { q?: string; from?: string; to?: string };
export default async function AdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin(); const params = await searchParams; const q = params.q?.trim() || "";
  const dateWhere = params.from || params.to ? { saleDate: { ...(params.from ? { gte: new Date(`${params.from}T00:00:00Z`) } : {}), ...(params.to ? { lte: new Date(`${params.to}T00:00:00Z`) } : {}) } } : {};
  const where: Prisma.CustomerWhereInput = q ? { OR: [{ customerId: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { alternatePhone: { contains: q } }, { address: { contains: q, mode: "insensitive" } }, { createdByAgentName: { contains: q, mode: "insensitive" } }, { lastActionAgentName: { contains: q, mode: "insensitive" } }, { purchases: { some: { OR: [{ primaryIssue: { contains: q, mode: "insensitive" } }, { serviceDetails: { contains: q, mode: "insensitive" } }, { agentName: { contains: q, mode: "insensitive" } }] } } }] } : {};
  const [customers, totals, failedSends, audits] = await Promise.all([
    prisma.customer.findMany({ where, include: { purchases: { orderBy: { createdAt: "desc" }, take: 1 }, agreements: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.purchase.groupBy({ by: ["currency"], where: dateWhere, _sum: { salesAmount: true }, _count: true }),
    prisma.confirmationSend.count({ where: { status: "FAILED" } }), prisma.adminAuditEvent.findMany({ orderBy: { timestamp: "desc" }, take: 20 }),
  ]);
  return <InternalShell role="Administrator" logoutAction={adminLogoutAction}><p className="internal-eyebrow">Owner operations</p><h1>Customer administration</h1><p className="internal-lead">Search complete customer and service records, review totals by currency, delivery failures and recent audited actions.</p>
    <section className="internal-card" style={{ padding: "1.5rem" }}><form className="internal-form-grid"><label>Search all customer and service fields<input name="q" defaultValue={q} /></label><label>Sale date from<input name="from" type="date" defaultValue={params.from} /></label><label>Sale date to<input name="to" type="date" defaultValue={params.to} /></label><button className="internal-primary" type="submit">Run report</button></form><div className="summary-grid">{totals.map((item) => <span key={item.currency}>{item.currency} sales ({item._count})<strong>{item.currency} {item._sum.salesAmount?.toFixed(2) ?? "0.00"}</strong></span>)}<span>Failed confirmation sends<strong>{failedSends}</strong></span><span>Matching customers<strong>{customers.length}</strong></span></div></section>
    <section className="internal-card" style={{ marginTop: "1.25rem" }}><div className="internal-section-heading"><h2>Customer records</h2><span>Up to 200 results</span></div><div className="internal-table-wrap"><table className="internal-table"><thead><tr><th>Customer</th><th>Contact</th><th>Latest sale</th><th>Agreement</th><th>Agents</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><Link href={`/admin/customers/${customer.id}`}>{customer.customerId}</Link><span>{customer.name}</span></td><td>{customer.email}<span>{customer.phone || "No phone"}</span></td><td>{customer.purchases[0] ? `${customer.purchases[0].currency} ${customer.purchases[0].salesAmount.toFixed(2)}` : "None"}<span>{customer.purchases[0]?.saleDate.toISOString().slice(0, 10)}</span></td><td><span className={`status-chip ${(customer.agreements[0]?.status || "draft").toLowerCase()}`}>{customer.agreements[0]?.status || "NONE"}</span></td><td>{customer.createdByAgentName}<span>Last: {customer.lastActionAgentName}</span></td></tr>)}</tbody></table></div></section>
    <section className="internal-card" style={{ padding: "1.5rem", marginTop: "1.25rem" }}><h2>Recent audit events</h2><ul className="audit-list">{audits.map((event) => <li key={event.id}><strong>{event.action} Â· {event.actorRole}{event.actorName ? ` Â· ${event.actorName}` : ""}</strong><span>{event.timestamp.toISOString()} Â· {event.success ? "success" : "failed"} Â· target {event.targetId || "none"}</span></li>)}</ul></section>
  </InternalShell>;
}


