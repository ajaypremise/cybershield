import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireAgent } from "@/lib/auth";
import { maskEmail, maskName } from "@/lib/masking";
import { verifyPortalToken } from "@/lib/portal-token";
import { InternalShell } from "@/components/internal/InternalShell";
import { agentLogoutAction } from "./login/actions";
import { addAgentNoteAction, createConfirmationAction, exactLookupAction, resendConfirmationAction, sendAgreementAction } from "./actions";

type Params = { success?: string; error?: string; record?: string; match?: string; matchName?: string; matchEmail?: string };
export default async function PortalPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await requireAgent(); const params = await searchParams;
  const payload = params.record ? verifyPortalToken(params.record, session.id, "record") : null;
  const customer = payload ? await prisma.customer.findUnique({ where: { id: payload.customerId }, include: { purchases: { orderBy: { createdAt: "desc" }, take: 1 }, agreements: { orderBy: { createdAt: "desc" }, take: 1 } } }) : null;
  const today = new Date().toISOString().slice(0, 10);
  return <InternalShell role="Agent" logoutAction={agentLogoutAction}>
    <p className="internal-eyebrow">Customer operations</p><h1>Confirmation and agreement portal</h1><p className="internal-lead">Create a customer confirmation, or retrieve one customer only by exact customer ID or exact email. This portal intentionally has no customer list, broad search or autocomplete.</p>
    {params.success && <div className="internal-alert success"><strong>Completed</strong><span>{params.success}</span></div>}{params.error && <div className="internal-alert error"><strong>Action failed</strong><span>{params.error}</span></div>}
    {params.match && <div className="internal-alert error"><strong>Possible existing customer</strong><span>{params.matchName} · {params.matchEmail}. Confirm the identity, then submit the form again using “Reuse matched customer”.</span></div>}
    <div className="internal-grid"><section className="internal-card" style={{ padding: "1.5rem" }}><h2>New confirmation</h2><form action={createConfirmationAction} className="internal-form">
      <input type="hidden" name="csrfToken" value={session.csrfToken} /><input type="hidden" name="submissionKey" value={randomUUID()} /><input type="hidden" name="idempotencyKey" value={randomUUID()} />{params.match && <input type="hidden" name="reuseToken" value={params.match} />}
      <div className="internal-form-grid"><label>First name<input name="firstName" required maxLength={100} /></label><label>Last name<input name="lastName" maxLength={100} /></label></div>
      <label>Email<input name="email" type="email" required maxLength={320} /></label><div className="internal-form-grid"><label>Phone<input name="phone" required maxLength={40} /></label><label>Alternate phone<input name="alternatePhone" maxLength={40} /></label></div>
      <label>Service address<textarea name="address" required maxLength={1000} rows={3} /></label><div className="internal-form-grid"><label>Sales amount<input name="salesAmount" inputMode="decimal" required /></label><label>Currency<select name="currency" defaultValue="AUD"><option>AUD</option><option>USD</option><option>GBP</option></select></label></div>
      <div className="internal-form-grid"><label>Sale date<input name="saleDate" type="date" defaultValue={today} required /></label><label>Agent name<input name="agentName" required maxLength={160} /></label></div>
      <label>Primary issue<textarea name="primaryIssue" required maxLength={2000} rows={3} /></label><label>Service details<textarea name="serviceDetails" required maxLength={4000} rows={4} /></label><label>Internal notes (never emailed)<textarea name="internalNotes" maxLength={4000} rows={3} /></label>
      <button className="internal-primary" type="submit">{params.match ? "Reuse matched customer and send" : "Save and send confirmation"}</button>
    </form></section>
    <div><section className="internal-card" style={{ padding: "1.5rem" }}><h2>Exact customer lookup</h2><form action={exactLookupAction} className="internal-form"><input type="hidden" name="csrfToken" value={session.csrfToken} /><label>Exact customer ID or email<input name="query" required maxLength={320} placeholder="CS-2026-000123 or customer@example.com" /></label><button className="internal-secondary" type="submit">Retrieve customer</button></form></section>
    {customer && params.record && <section className="internal-card" style={{ padding: "1.5rem", marginTop: "1.25rem" }}><p className="internal-eyebrow">Retrieved record</p><h2>{maskName(customer.firstName, customer.lastName)}</h2><div className="summary-grid"><span>Customer ID<strong>{customer.customerId}</strong></span><span>Email<strong>{maskEmail(customer.email)}</strong></span><span>Last confirmation<strong>{customer.purchases[0]?.status ?? "None"}</strong></span><span>Agreement<strong>{customer.agreements[0]?.status ?? "None"}</strong></span></div>
      <form action={resendConfirmationAction} className="internal-form" style={{ marginTop: "1rem" }}><input type="hidden" name="recordToken" value={params.record} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><input type="hidden" name="idempotencyKey" value={randomUUID()} /><label>Agent name<input name="agentName" required /></label><button className="internal-secondary">Resend confirmation</button></form>
      <form action={sendAgreementAction} className="internal-form" style={{ marginTop: "1rem" }}><input type="hidden" name="recordToken" value={params.record} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><input type="hidden" name="idempotencyKey" value={randomUUID()} /><label>Agent name<input name="agentName" required /></label><button className="internal-primary">Send or resend agreement</button></form>
      <form action={addAgentNoteAction} className="internal-form" style={{ marginTop: "1rem" }}><input type="hidden" name="recordToken" value={params.record} /><input type="hidden" name="csrfToken" value={session.csrfToken} /><label>Agent name<input name="agentName" required /></label><label>Append internal note<textarea name="noteText" required maxLength={4000} rows={3} /></label><button className="internal-secondary">Add note</button></form>
    </section>}</div></div>
  </InternalShell>;
}
