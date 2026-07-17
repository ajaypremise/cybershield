export type EnvironmentName = "DATABASE_URL" | "RESEND_API_KEY" | "RESEND_FROM_EMAIL" | "CYBERSHIELD_INTERNAL_EMAIL" | "ADMIN_PASSWORD" | "AGENT_PORTAL_PASSWORD" | "APP_BASE_URL" | "SIGNING_TOKEN_SECRET" | "PRIVATE_STORAGE_BUCKET" | "BLOB_READ_WRITE_TOKEN";
export function env(name: EnvironmentName): string { const value = process.env[name]?.trim(); if (!value) throw new Error(`Server configuration is missing ${name}`); return value; }
export function appBaseUrl() { return env("APP_BASE_URL").replace(/\/$/, ""); }
