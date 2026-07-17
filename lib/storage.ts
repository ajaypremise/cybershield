import { put } from "@vercel/blob";
import { env } from "@/lib/env";

function privatePath(path: string): string {
  const prefix = env("PRIVATE_STORAGE_BUCKET").replace(/[^a-zA-Z0-9/_-]/g, "-");
  return `${prefix}/${path.replace(/^\/+/, "")}`;
}

export async function storePrivateFile(path: string, body: Buffer, contentType: string): Promise<string> {
  const blob = await put(privatePath(path), body, {
    access: "private",
    addRandomSuffix: false,
    contentType,
    token: env("BLOB_READ_WRITE_TOKEN"),
  });
  return blob.url;
}

export async function readPrivateFile(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${env("BLOB_READ_WRITE_TOKEN")}` }, cache: "no-store" });
  if (!response.ok) throw new Error("Private document could not be retrieved");
  return Buffer.from(await response.arrayBuffer());
}

