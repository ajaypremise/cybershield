import { describe, expect, it } from "vitest";
import { getOrCreateCustomer, type CustomerRecord, type CustomerRepository } from "@/lib/customer";
import { normalizeEmail } from "@/lib/validation";
import { randomPublicId } from "@/lib/crypto";

function repository(seed: CustomerRecord[] = []) {
  const records = [...seed]; let collision = false;
  const repo: CustomerRepository = {
    findByEmail: async (email) => records.find((item) => item.normalizedEmail === email) || null,
    update: async (id, data) => Object.assign(records.find((item) => item.id === id)!, data),
    create: async (data) => { if (records.some((item) => item.customerId === data.customerId) || collision) { collision = false; throw new Error("unique"); } const record = { id: String(records.length + 1), ...data }; records.push(record); return record; },
  };
  return { repo, records, collideOnce: () => { collision = true; } };
}

describe("customer identity", () => {
  it("creates cryptographically random public IDs in the required format", () => { const ids = new Set(Array.from({ length: 50 }, () => randomPublicId())); expect(ids.size).toBe(50); for (const id of ids) expect(id).toMatch(/^CSA-[23456789A-HJ-NP-Z]{6}$/); });
  it("normalises email case and whitespace", () => expect(normalizeEmail("  Person@Example.COM ")).toBe("person@example.com"));
  it("reuses the permanent customer ID for the same normalised email", async () => { const store = repository(); const first = await getOrCreateCustomer(store.repo, { name: "First", email: "Person@Example.com" }, () => "CSA-AAAAAA"); const second = await getOrCreateCustomer(store.repo, { name: "Updated", email: " person@example.COM " }, () => "CSA-BBBBBB"); expect(second.customerId).toBe(first.customerId); expect(store.records).toHaveLength(1); });
  it("retries safely after a customer ID collision", async () => { const store = repository(); store.collideOnce(); const ids = ["CSA-COLLID", "CSA-SAFER2"]; const customer = await getOrCreateCustomer(store.repo, { name: "Jane", email: "jane@example.com" }, () => ids.shift()!); expect(customer.customerId).toBe("CSA-SAFER2"); });
});

