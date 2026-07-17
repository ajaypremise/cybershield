# CyberShield purchase confirmations and agreements

This document covers the production setup for the protected `/email` and `/agreement` pages and the public `/sign/[token]` workflow. The public homepage remains independent.

## Required environment variables

Copy `.env.example` into the relevant local or Vercel environment and provide real secret values. Never commit those values.

- `DATABASE_URL`: PostgreSQL connection string. Use one production database; the application does not require a second database.
- `RESEND_API_KEY`: restricted Resend API key for transactional sending.
- `RESEND_FROM_EMAIL`: verified sender, recommended value `CyberShield <support@updates.cybershieldau.com.au>`.
- `CYBERSHIELD_INTERNAL_EMAIL`: completed-agreement recipient, normally `info@cybershieldau.com.au`.
- `ADMIN_PASSWORD`: long, unique internal password. Store only in Vercel environment settings.
- `APP_BASE_URL`: canonical HTTPS origin with no trailing slash.
- `SIGNING_TOKEN_SECRET`: at least 32 random bytes, encoded as hex or base64. It signs short-lived internal download and completion references; raw customer signing tokens are independently random and stored only as SHA-256 hashes.
- `PRIVATE_STORAGE_BUCKET`: a logical prefix for private CyberShield objects, for example `cybershield-private`.
- `BLOB_READ_WRITE_TOKEN`: token supplied by the connected private Vercel Blob store.

Generate secrets with a cryptographically secure password manager or `openssl rand -hex 32`. Do not reuse the admin password as the signing-token secret.

## PostgreSQL migration

The Prisma schema is `prisma/schema.prisma`. The initial production migration is:

`prisma/migrations/20260717090000_purchase_agreements/migration.sql`

It creates:

- `customers`, with unique permanent public customer IDs and unique normalised emails;
- `purchases`, with fixed-precision `DECIMAL(12,2)` AUD amounts and unique submission keys;
- `agreements`, with immutable snapshots, status, hashed tokens, signature/PDF references and Resend IDs;
- `agreement_events`, for signing audit history;
- `admin_sessions`, `rate_limits`, and `admin_audit_events` for protected operations.

The migration includes foreign keys, positive-amount and AUD constraints, unique indexes, and query indexes for customer history, status, expiry, audit history and sessions.

Apply it once to the production database before enabling the routes:

```text
pnpm prisma:migrate
```

Use a direct/non-pooling migration URL if the PostgreSQL provider requires one. Back up an existing production database before applying any migration.

## Private document storage

Create a Vercel Blob store configured for private access and connect it to the Vercel project. The application stores signatures and PDFs with `access: private`; their storage URLs are never returned to customers. Internal PDF downloads require both a valid admin session and a five-minute application-signed download token, then the server proxies the private object with `Cache-Control: private, no-store`.

Confirm the store is private before production use. If an existing Vercel Blob store is public, create a private store instead of reusing it.

## Resend sending subdomain and DNS

Use `updates.cybershieldau.com.au` as the transactional sending subdomain so the main business-mail domain remains isolated.

1. In Resend, add the domain `updates.cybershieldau.com.au`.
2. Resend will display domain-specific DKIM and SPF verification records. Add the exact TXT/CNAME records shown by Resend at the DNS provider.
3. Do not replace, delete or edit any MX records for `cybershieldau.com.au`; those records continue serving ordinary business email.
4. If Resend displays a return-path record scoped specifically to the new `updates` subdomain, add only that scoped record as instructed. Do not point the root domain's mail exchange to Resend.
5. Wait for Resend to show the domain as verified, then set `RESEND_FROM_EMAIL` to the verified address.
6. Send test confirmations to multiple mailbox providers and check SPF/DKIM alignment before customer use.

DNS values are intentionally not hard-coded here because Resend generates unique verification values for each account and domain.

## Access and operational flow

1. Visit `/admin/login` and enter `ADMIN_PASSWORD`.
2. A server-side database session is created in an HTTP-only, Secure, SameSite=Strict cookie and expires after eight hours.
3. Visit `/email` to search/create a customer, record a purchase and send or deliberately resend a confirmation.
4. Use **Create Agreement** or visit `/agreement` to select a customer purchase, preview the exact versioned wording, create a draft, and confirm sending.
5. The customer follows a seven-day, single-use `/sign/[token]` link. The database stores only the token's SHA-256 hash.
6. Once signed, the agreement becomes immutable, the private signature and signed PDF are stored, and copies are attempted to both the customer and CyberShield.

## Legal review

All contractual wording is in `lib/agreement/content.ts`, currently version `1.0.0`. Code comments mark clauses requiring legal review without exposing developer notes to customers. Australian counsel should review at minimum:

- data handling and privacy, including the referenced privacy practices;
- fees, renewals, cancellation, refunds and Australian Consumer Law treatment;
- liability limitations, exclusions and the final liability cap/service schedule;
- Victorian governing-law and jurisdiction wording;
- Electronic Transactions Act consent and any excluded transaction types.

When counsel approves changed wording, increment `AGREEMENT_VERSION`. Existing agreement snapshots and signed PDFs remain unchanged; create a new agreement version rather than editing a signed agreement.

## Pre-production checklist

- Set all environment variables for Production and Preview as appropriate.
- Apply the PostgreSQL migration and verify backups.
- Connect and verify a private Vercel Blob store.
- Verify the Resend subdomain and perform delivery tests.
- Review the agreement with an Australian lawyer.
- Test `/admin/login`, `/email`, `/agreement`, token expiry, voiding, signing on touch and mouse devices, both signed-PDF emails, and internal PDF download in a preview deployment.
- Review Vercel function and Resend logs without adding raw signing-token, signature or customer-data logging.

No deployment is performed by this repository change.

