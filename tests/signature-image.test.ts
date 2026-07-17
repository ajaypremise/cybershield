import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { validateSignatureImage } from "@/lib/validation";

describe("server-side signature pixels", () => {
  it("rejects a syntactically valid blank white PNG", async () => { const blank = await sharp({ create: { width: 600, height: 220, channels: 4, background: "white" } }).png().toBuffer(); await expect(validateSignatureImage(blank)).rejects.toThrow("draw a signature"); });
  it("accepts a PNG containing a visible signature stroke", async () => { const signed = await sharp({ create: { width: 600, height: 220, channels: 4, background: "white" } }).composite([{ input: Buffer.from('<svg width="600" height="220"><path d="M80 150 C180 20 260 210 500 70" fill="none" stroke="black" stroke-width="8"/></svg>') }]).png().toBuffer(); await expect(validateSignatureImage(signed)).resolves.toBeUndefined(); });
});

