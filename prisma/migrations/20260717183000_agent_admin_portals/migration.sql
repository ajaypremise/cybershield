-- Add the separate agent/admin portal model without deleting existing data.
CREATE TYPE "Currency" AS ENUM ('AUD', 'USD', 'GBP');
CREATE TYPE "SendStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TABLE "customers"
  ADD COLUMN "customer_serial" BIGSERIAL,
  ADD COLUMN "first_name" TEXT,
  ADD COLUMN "last_name" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "normalized_phone" TEXT,
  ADD COLUMN "alternate_phone" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "created_by_agent_name" TEXT,
  ADD COLUMN "last_action_agent_name" TEXT;
UPDATE "customers" SET
  "first_name" = COALESCE(NULLIF(split_part(trim("name"), ' ', 1), ''), 'Customer'),
  "last_name" = NULLIF(trim(substr(trim("name"), length(split_part(trim("name"), ' ', 1)) + 1)), ''),
  "address" = 'Not provided (legacy record)',
  "created_by_agent_name" = 'Legacy system',
  "last_action_agent_name" = 'Legacy system';
ALTER TABLE "customers" ALTER COLUMN "first_name" SET NOT NULL, ALTER COLUMN "address" SET NOT NULL,
  ALTER COLUMN "created_by_agent_name" SET NOT NULL, ALTER COLUMN "last_action_agent_name" SET NOT NULL;
CREATE UNIQUE INDEX "customers_customer_serial_key" ON "customers"("customer_serial");
CREATE UNIQUE INDEX "customers_normalized_phone_key" ON "customers"("normalized_phone");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customers_address_idx" ON "customers"("address");

ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "purchases_aud_currency";
ALTER TABLE "purchases" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "purchases" ALTER COLUMN "currency" TYPE "Currency" USING "currency"::"Currency";
ALTER TABLE "purchases" ALTER COLUMN "currency" SET DEFAULT 'AUD';
ALTER TABLE "purchases" ADD COLUMN "sale_date" DATE, ADD COLUMN "primary_issue" TEXT,
  ADD COLUMN "service_details" TEXT, ADD COLUMN "created_by_agent_name" TEXT, ADD COLUMN "last_action_agent_name" TEXT;
UPDATE "purchases" SET "sale_date" = "created_at"::date,
  "primary_issue" = 'Not provided (legacy record)', "service_details" = COALESCE(NULLIF("tenure", ''), 'Not provided (legacy record)'),
  "created_by_agent_name" = COALESCE(NULLIF("agent_name", ''), 'Legacy system'),
  "last_action_agent_name" = COALESCE(NULLIF("agent_name", ''), 'Legacy system');
ALTER TABLE "purchases" ALTER COLUMN "sale_date" SET NOT NULL, ALTER COLUMN "primary_issue" SET NOT NULL,
  ALTER COLUMN "service_details" SET NOT NULL, ALTER COLUMN "created_by_agent_name" SET NOT NULL,
  ALTER COLUMN "last_action_agent_name" SET NOT NULL;
CREATE INDEX "purchases_currency_sale_date_idx" ON "purchases"("currency", "sale_date");

ALTER TABLE "agreements" ADD COLUMN "last_action_agent_name" TEXT NOT NULL DEFAULT 'Legacy import';
ALTER TABLE "admin_audit_events" ADD COLUMN "actor_role" TEXT NOT NULL DEFAULT 'ADMIN',
  ADD COLUMN "actor_name" TEXT, ADD COLUMN "success" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "admin_audit_events_actor_role_timestamp_idx" ON "admin_audit_events"("actor_role", "timestamp" DESC);

CREATE TABLE "agent_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "token_hash" CHAR(64) NOT NULL, "csrf_token" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agent_sessions_token_hash_key" ON "agent_sessions"("token_hash");
CREATE INDEX "agent_sessions_expires_at_idx" ON "agent_sessions"("expires_at");

CREATE TABLE "internal_notes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "customer_id" UUID NOT NULL, "note_text" TEXT NOT NULL,
  "agent_name" TEXT NOT NULL, "source" TEXT NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "internal_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "internal_notes_customer_id_created_at_idx" ON "internal_notes"("customer_id", "created_at" DESC);

CREATE TABLE "confirmation_sends" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "customer_id" UUID NOT NULL, "purchase_id" UUID NOT NULL,
  "send_type" TEXT NOT NULL, "status" "SendStatus" NOT NULL DEFAULT 'PENDING', "resend_email_id" TEXT,
  "idempotency_key" UUID NOT NULL, "attempted_by_agent_name" TEXT NOT NULL, "provider_error_name" TEXT,
  "provider_error_message" TEXT, "provider_error_status_code" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completed_at" TIMESTAMPTZ(6),
  CONSTRAINT "confirmation_sends_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "confirmation_sends_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "confirmation_sends_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "confirmation_sends_idempotency_key_key" ON "confirmation_sends"("idempotency_key");
CREATE INDEX "confirmation_sends_customer_id_created_at_idx" ON "confirmation_sends"("customer_id", "created_at" DESC);
CREATE INDEX "confirmation_sends_purchase_id_created_at_idx" ON "confirmation_sends"("purchase_id", "created_at" DESC);

CREATE TABLE "agreement_sends" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "customer_id" UUID NOT NULL, "agreement_id" UUID NOT NULL,
  "send_type" TEXT NOT NULL, "status" "SendStatus" NOT NULL DEFAULT 'PENDING', "resend_email_id" TEXT,
  "idempotency_key" UUID NOT NULL, "attempted_by_agent_name" TEXT NOT NULL, "provider_error_name" TEXT,
  "provider_error_message" TEXT, "provider_error_status_code" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completed_at" TIMESTAMPTZ(6),
  CONSTRAINT "agreement_sends_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "agreement_sends_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "agreement_sends_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "agreement_sends_idempotency_key_key" ON "agreement_sends"("idempotency_key");
CREATE INDEX "agreement_sends_customer_id_created_at_idx" ON "agreement_sends"("customer_id", "created_at" DESC);
CREATE INDEX "agreement_sends_agreement_id_created_at_idx" ON "agreement_sends"("agreement_id", "created_at" DESC);
