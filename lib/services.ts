import type { CoverageType, ServiceType, TenureUnit } from "@prisma/client";

export const EMAIL_TEMPLATE_VERSION = "2.0.0";
export const PDF_TEMPLATE_VERSION = "2.0.0";
export const AGREEMENT_TEMPLATE_VERSION = "2.0.0";

export const SERVICES = {
  NETWORK_SECURITY: {
    name: "Network Security",
    heading: "Network and Device Security Support",
    summary: "Device and home/business network support, security guidance, software update assistance, optimisation support and cybersecurity assistance.",
    areas: ["Security support for covered devices", "Network-security guidance", "Software update and installation assistance", "Device optimisation support", "Assistance responding to suspicious digital activity"],
  },
  IDENTITY_IP_PROTECTOR: {
    name: "Identity & IP Protector",
    heading: "Identity, Privacy and IP Protection Support",
    summary: "Identity, privacy and IP protection support, identity-risk assistance, breach and fraud guidance, privacy support and related device/network security assistance.",
    areas: ["Identity-risk and privacy support", "IP exposure and online-privacy guidance", "Suspected identity misuse assistance", "Account-security and data-breach response guidance", "Fraud-risk support"],
  },
} as const satisfies Record<ServiceType, { name: string; heading: string; summary: string; areas: readonly string[] }>;

export function calculateCoverageEnd(start: Date, value: number, unit: TenureUnit) {
  if (!Number.isInteger(value) || value <= 0) throw new Error("Tenure must be a positive whole number");
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  if (unit === "DAYS") end.setUTCDate(end.getUTCDate() + value);
  if (unit === "MONTHS") end.setUTCMonth(end.getUTCMonth() + value);
  if (unit === "YEARS") end.setUTCFullYear(end.getUTCFullYear() + value);
  end.setUTCDate(end.getUTCDate() - 1);
  return end;
}

export function coverageLabel(input: { coverageType: CoverageType | null; tenureValue: number | null; tenureUnit: TenureUnit | null }) {
  if (input.coverageType === "LIFETIME") return "Lifetime Coverage";
  if (!input.tenureValue || !input.tenureUnit) return "Legacy record Ã¢â‚¬â€ review required";
  const unit = input.tenureUnit.toLowerCase();
  return `${input.tenureValue} ${input.tenureValue === 1 ? unit.slice(0, -1) : unit}`;
}

export function formatMoney(amount: { toString(): string }, currency: string) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(Number(amount.toString()));
}
