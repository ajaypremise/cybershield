import { beforeEach, describe, expect, it } from "vitest";
import { createPortalToken, verifyPortalToken } from "@/lib/portal-token";
describe("portal record tokens", () => {
  beforeEach(() => { process.env.SIGNING_TOKEN_SECRET = "a-secure-test-secret-with-sufficient-entropy"; });
  it("binds record access to the authenticated agent session", () => { const token = createPortalToken("customer-1", "session-1", "record"); expect(verifyPortalToken(token, "session-1", "record")?.customerId).toBe("customer-1"); expect(verifyPortalToken(token, "session-2", "record")).toBeNull(); expect(verifyPortalToken(token, "session-1", "reuse")).toBeNull(); });
});

