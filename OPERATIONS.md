# CyberShield operations

## Access

Agents sign in at `/portal` with `AGENT_PORTAL_PASSWORD`. Administrators sign in at `/admin/login` with `ADMIN_PASSWORD`. Both use separate server-side sessions, separate HTTP-only SameSite cookies and CSRF tokens, and expire after eight hours.

The agent portal has no customer directory. Retrieval requires an exact customer ID or exact email and returns masked data. A short-lived signed record token is bound to the current agent session. Possible email/phone matches require a deliberate second submission before an existing customer is reused.

## Database migration

Migration `20260717183000_agent_admin_portals` is additive and backfills legacy records. Review it before production use. Do not add Prisma migration commands to the Vercel build.

Run it once from GitHub: repository **Actions** → **Run Prisma Migration** → **Run workflow** → select `main` → **Run workflow**. The workflow uses the repository Actions secret `DATABASE_URL` and runs `pnpm prisma migrate deploy --schema prisma/schema.prisma` only when manually dispatched.

## Email and documents

Customer confirmation emails/PDFs and agreement snapshots exclude sales amount, currency, agent names, internal issues, service details and internal notes. Provider IDs and safe failure details are retained in send-history tables. Signed PDFs remain in private Blob storage and are available only through authenticated or token-authorized download routes.

Resend must verify `updates.cybershieldau.com.au`. Add Resend's exact DKIM/SPF and requested return-path records to that subdomain without changing the existing business-email MX records.

## Legal review

Australian counsel must approve privacy, cancellation/refund, Australian Consumer Law, liability, Victorian jurisdiction and electronic-signature language before agreement version `1.1.0` is used in production.
