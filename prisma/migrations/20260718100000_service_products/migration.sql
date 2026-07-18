CREATE TYPE "ServiceType" AS ENUM ('NETWORK_SECURITY', 'IDENTITY_IP_PROTECTOR');
CREATE TYPE "CoverageType" AS ENUM ('FIXED', 'LIFETIME');
CREATE TYPE "TenureUnit" AS ENUM ('DAYS', 'MONTHS', 'YEARS');

ALTER TABLE "purchases"
  ADD COLUMN "service_type" "ServiceType",
  ADD COLUMN "coverage_start_date" DATE,
  ADD COLUMN "coverage_end_date" DATE,
  ADD COLUMN "coverage_type" "CoverageType",
  ADD COLUMN "tenure_value" INTEGER,
  ADD COLUMN "tenure_unit" "TenureUnit",
  ADD COLUMN "service_display_name_snapshot" TEXT,
  ADD COLUMN "service_summary_snapshot" TEXT,
  ADD COLUMN "email_template_version" TEXT,
  ADD COLUMN "pdf_template_version" TEXT,
  ADD COLUMN "agreement_template_version" TEXT,
  ADD COLUMN "confirmation_number" TEXT,
  ADD COLUMN "legacy_review_required" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "purchases" ADD CONSTRAINT "purchases_tenure_value_positive" CHECK ("tenure_value" IS NULL OR "tenure_value" > 0);
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_coverage_consistency" CHECK (
  ("coverage_type" IS NULL AND "legacy_review_required" = true)
  OR ("coverage_type" = 'LIFETIME' AND "tenure_value" IS NULL AND "tenure_unit" IS NULL AND "coverage_end_date" IS NULL)
  OR ("coverage_type" = 'FIXED' AND "tenure_value" IS NOT NULL AND "tenure_unit" IS NOT NULL AND "coverage_end_date" IS NOT NULL)
);
CREATE UNIQUE INDEX "purchases_confirmation_number_key" ON "purchases"("confirmation_number");
CREATE INDEX "purchases_service_type_coverage_type_sale_date_idx" ON "purchases"("service_type", "coverage_type", "sale_date");
CREATE INDEX "purchases_legacy_review_required_idx" ON "purchases"("legacy_review_required");

-- Existing sales are intentionally retained without a guessed service or coverage type.
UPDATE "purchases" SET "legacy_review_required" = true WHERE "service_type" IS NULL;


-- New application-created records are complete; only pre-existing rows remain review-required.
ALTER TABLE "purchases" ALTER COLUMN "legacy_review_required" SET DEFAULT false;
