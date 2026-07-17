import { notFound } from "next/navigation";
import { verifyCompletionToken } from "@/lib/completion-token";
import { prisma } from "@/lib/db";
import { formatAest } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agreement completed", robots: { index: false, follow: false } };

export default async function CompletionPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token || ""; const agreementId = verifyCompletionToken(token); if (!agreementId) notFound();
  const agreement = await prisma.agreement.findUnique({ where: { id: agreementId }, include: { customer: true } });
  if (!agreement || agreement.status !== "SIGNED" || !agreement.signedAt) notFound();
  return <main className="sign-root"><div className="sign-shell"><header className="sign-brand"><img src="/cybershield-logo.png" alt="CyberShield" /></header><section className="sign-complete"><div className="complete-check">✓</div><p>Agreement completed</p><h1>Thank you, {agreement.customer.name}</h1><span>Your signed agreement has been securely recorded. A PDF copy is being delivered to your email address.</span><dl><div><dt>Agreement number</dt><dd>{agreement.agreementNumber}</dd></div><div><dt>Signing date</dt><dd>{formatAest(agreement.signedAt)}</dd></div><div><dt>Customer ID</dt><dd>{agreement.customer.customerId}</dd></div></dl><small>If you do not receive the email, contact info@cybershieldau.com.au or call 1800 997 002.</small></section></div></main>;
}

