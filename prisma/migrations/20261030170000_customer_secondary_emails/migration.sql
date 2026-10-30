ALTER TABLE "customers" ADD COLUMN "secondary_emails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
