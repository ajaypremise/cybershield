import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContactInformationPdf, type ConfirmationPdfProps } from "@/components/pdf/ContactInformationPdf";
import { AgreementPdf, type AgreementPdfProps } from "@/components/pdf/AgreementPdf";

async function logoDataUrl() {
  try { const data = await readFile(path.join(process.cwd(), "public", "cybershield-logo.png")); return `data:image/png;base64,${data.toString("base64")}`; }
  catch { return undefined; }
}
export function generateCustomerConfirmationPdf(props: ConfirmationPdfProps): Promise<Buffer> { return renderToBuffer(<ContactInformationPdf {...props} />); }
export const generateContactInformationPdf = generateCustomerConfirmationPdf;
export async function generateAgreementPdf(props: Omit<AgreementPdfProps, "logoDataUrl">): Promise<Buffer> { return renderToBuffer(<AgreementPdf {...props} logoDataUrl={await logoDataUrl()} />); }

