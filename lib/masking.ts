export function maskName(firstName: string, lastName?: string | null) {
  const part = (value: string) => value.length <= 1 ? "*" : `${value[0]}${"*".repeat(Math.min(value.length - 1, 6))}`;
  return [part(firstName), lastName ? part(lastName) : ""].filter(Boolean).join(" ");
}

export function maskEmail(email: string) {
  const [local, domain = ""] = email.split("@");
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(3, Math.min(local.length - 1, 8)))}@${domain}`;
}

export function isExactCustomerLookup(query: string) {
  const value = query.trim();
  return /^CS-\d{4}-\d{6}$/i.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

