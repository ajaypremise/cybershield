import { describe, expect, it } from "vitest";
import { createPurchaseOnce } from "@/lib/purchase";
import { claimAgreementSigning } from "@/lib/agreement/signing-claim";

describe("idempotency and atomic signing", () => {
  it("prevents duplicate purchase creation for the same submission key", async () => { let record: { id: string } | null = null; let creates = 0; const repo = { findBySubmissionKey: async () => record, create: async () => { creates += 1; record = { id: "purchase-1" }; return record; } }; const first = await createPurchaseOnce(repo); const second = await createPurchaseOnce(repo); expect(first.created).toBe(true); expect(second.created).toBe(false); expect(creates).toBe(1); });
  it("allows only one atomic signing claim and records one event", async () => { let claimed = false; let events = 0; const tx = { agreement: { updateMany: async () => { if (claimed) return { count: 0 }; claimed = true; return { count: 1 }; } }, agreementEvent: { create: async () => { events += 1; } } }; const input = { agreementId: "a", tokenHash: "h", signedAt: new Date(), typedSignerName: "Jane", signatureFileUrl: "private:sig", signedPdfUrl: "private:pdf", signerIp: "unknown", signerUserAgent: "test", signerConsentText: "consent", documentHash: "d" }; const results = await Promise.all([claimAgreementSigning(tx, input), claimAgreementSigning(tx, input)]); expect(results.sort()).toEqual([false, true]); expect(events).toBe(1); });
});

