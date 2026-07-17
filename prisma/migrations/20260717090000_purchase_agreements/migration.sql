CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERY_FAILED');
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'EXPIRED', 'VOID');

CREATE TABLE "customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "normalized_email" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "purchases" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE RESTRICT,
  "tenure" TEXT NOT NULL,
  "amount_paid" DECIMAL(12,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'AUD',
  "agent_name" TEXT NOT NULL,
  "confirmation_sent_at" TIMESTAMPTZ(6),
  "resend_email_id" TEXT,
  "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
  "submission_key" UUID NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "purchases_positive_amount" CHECK ("amount_paid" > 0),
  CONSTRAINT "purchases_aud_currency" CHECK ("currency" = 'AUD')
);

CREATE TABLE "agreements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE RESTRICT,
  "purchase_id" UUID NOT NULL REFERENCES "purchases"("id") ON DELETE RESTRICT,
  "agreement_number" TEXT NOT NULL UNIQUE,
  "agreement_version" TEXT NOT NULL,
  "agreement_content_snapshot" TEXT NOT NULL,
  "token_hash" CHAR(64) UNIQUE,
  "token_expires_at" TIMESTAMPTZ(6),
  "token_used_at" TIMESTAMPTZ(6),
  "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
  "sent_at" TIMESTAMPTZ(6),
  "viewed_at" TIMESTAMPTZ(6),
  "signed_at" TIMESTAMPTZ(6),
  "typed_signer_name" TEXT,
  "signature_file_url" TEXT,
  "signed_pdf_url" TEXT,
  "signer_ip" TEXT,
  "signer_user_agent" TEXT,
  "signer_consent_text" TEXT,
  "document_hash" CHAR(64),
  "resend_customer_email_id" TEXT,
  "resend_internal_email_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "agreement_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agreement_id" UUID NOT NULL REFERENCES "agreements"("id") ON DELETE CASCADE,
  "event_type" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "metadata" JSONB
);

CREATE TABLE "admin_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "token_hash" CHAR(64) NOT NULL UNIQUE,
  "csrf_token" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "rate_limits" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "scope" TEXT NOT NULL,
  "key_hash" CHAR(64) NOT NULL,
  "window_start" TIMESTAMPTZ(6) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("scope", "key_hash", "window_start")
);

CREATE TABLE "admin_audit_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "action" TEXT NOT NULL,
  "target_id" TEXT,
  "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_address" TEXT,
  "metadata" JSONB
);

CREATE INDEX "customers_name_idx" ON "customers"("name");
CREATE INDEX "purchases_customer_created_idx" ON "purchases"("customer_id", "created_at" DESC);
CREATE INDEX "purchases_status_created_idx" ON "purchases"("status", "created_at" DESC);
CREATE INDEX "agreements_customer_created_idx" ON "agreements"("customer_id", "created_at" DESC);
CREATE INDEX "agreements_purchase_idx" ON "agreements"("purchase_id");
CREATE INDEX "agreements_status_expiry_idx" ON "agreements"("status", "token_expires_at");
CREATE INDEX "agreement_events_agreement_time_idx" ON "agreement_events"("agreement_id", "timestamp");
CREATE INDEX "agreement_events_type_time_idx" ON "agreement_events"("event_type", "timestamp");
CREATE INDEX "admin_sessions_expiry_idx" ON "admin_sessions"("expires_at");
CREATE INDEX "rate_limits_window_idx" ON "rate_limits"("window_start");
CREATE INDEX "admin_audit_time_idx" ON "admin_audit_events"("timestamp" DESC);
CREATE INDEX "admin_audit_action_time_idx" ON "admin_audit_events"("action", "timestamp");

