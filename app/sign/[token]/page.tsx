import Link from "next/link";
import { notFound } from "next/navigation";
import { findAgreementByRawToken, recordAgreementViewed } from "@/lib/agreement/service";
import { requestContext } from "@/lib/request";
import { formatAest } from "@/lib/format";
import { SignatureForm } from "@/components/sign/SignatureForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "Review and sign agreement", robots: { index: false, follow: false } };
function TokenError({ title, text }: { title: string; text: string }) { return <main className="sign-root"><div className="sign-shell"><header className="sign-brand"><img src="/cybershield-logo.png" alt="CyberShield" /></header><section className="sign-error-card"><h1>{title}</h1><p>{text}</p><p>Contact CyberShield on 1800 997 002 or (03) 7046 5922 during 10:00 AM–9:00 PM AEST.</p></section></div></main>; }
export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; if (!token || token.length > 200) notFound(); const result = await findAgreementByRawToken(token);
  if (result.kind === "invalid") return <TokenError title="Signing link not recognised" text="This link is invalid. Ask CyberShield for a new one." />;
  if (result.kind === "expired") return <TokenError title="Signing link expired" text="Signing links expire after seven days. Ask CyberShield for a replacement." />;
  if (result.kind === "used") return <TokenError title="Agreement already completed" text="This single-use signing link has already been completed." />;
  if (result.kind === "void") return <TokenError title="Agreement no longer available" text="This agreement has been voided." />;
  const agreement = result.agreement; const context = await requestContext(); await recordAgreementViewed(agreement.id, context.ip, context.userAgent);
  return <main className="sign-root"><div className="sign-shell"><header className="sign-brand"><img src="/cybershield-logo.png" alt="CyberShield" /><div><span>Secure agreement</span><strong>{agreement.agreementNumber}</strong></div></header><section className="sign-hero"><p>Review before signing</p><h1>CyberShield Service Agreement</h1><span>This secure link expires {formatAest(agreement.tokenExpiresAt!)}.</span></section><section className="sign-summary"><div><span>Customer ID</span><strong>{agreement.customer.customerId}</strong></div><div><span>Customer</span><strong>{agreement.customer.name}</strong><small>{agreement.customer.email}</small></div><div><span>Service address</span><strong>{agreement.customer.address}</strong></div><div><span>Coverage date</span><strong>{agreement.purchase.saleDate.toISOString().slice(0, 10)}</strong></div></section><section className="sign-document"><div className="sign-document-heading"><div><span>Agreement version {agreement.agreementVersion}</span><h2>Complete agreement</h2></div><Link href={`/api/sign/${encodeURIComponent(token)}/document`} target="_blank">Download / print unsigned PDF</Link></div><pre>{agreement.agreementContentSnapshot}</pre></section><SignatureForm token={token} customerName={agreement.customer.name} /><footer className="sign-footer"><strong>CyberShield Australia</strong><span>1800 997 002 · (03) 7046 5922 · info@cybershieldau.com.au</span></footer></div></main>;
}

