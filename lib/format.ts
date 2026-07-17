export function formatAud(amount: { toString(): string } | string | number): string {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(amount.toString()));
}

export function formatAest(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  }).format(date);
}

export function formatUtc(date: Date): string {
  return `${date.toISOString().replace("T", " ").replace(".000Z", " UTC")}`;
}

export function maskIp(ip: string | null): string {
  if (!ip || ip === "unknown") return "Not recorded";
  if (ip.includes(":")) return `${ip.split(":").slice(0, 3).join(":")}:…`;
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : "Masked";
}

