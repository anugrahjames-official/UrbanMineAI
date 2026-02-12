// Compliance Service for UrbanMineAI
// Handles Form-6 and EPR certificate generation using pdf-lib

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ComplianceData {
  transactionId: string;
  supplierName: string;
  buyerName: string;
  materialType: string;
  weightKg: number;
  date: string;
}

export async function generateForm6(data: ComplianceData): Promise<{ pdfBytes: Uint8Array, hash: string }> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('FORM-6: E-WASTE MANIFEST', {
      x: 50,
      y: 750,
      size: 20,
      font,
      color: rgb(0.07, 0.13, 0.09),
    });

    page.drawText(`Transaction ID: ${data.transactionId}`, { x: 50, y: 700, size: 12 });
    page.drawText(`Date: ${data.date}`, { x: 50, y: 680, size: 12 });
    page.drawText(`Supplier: ${data.supplierName}`, { x: 50, y: 650, size: 12 });
    page.drawText(`Buyer: ${data.buyerName}`, { x: 50, y: 630, size: 12 });
    page.drawText(`Material: ${data.materialType}`, { x: 50, y: 600, size: 12 });
    page.drawText(`Weight: ${data.weightKg} kg`, { x: 50, y: 580, size: 12 });

    const pdfBytes = await pdfDoc.save();
    
    // SHA-256 hash for verifiability (hex)
    const digest = await crypto.subtle.digest("SHA-256", pdfBytes as unknown as BufferSource);
    const hash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return { pdfBytes, hash: `0x${hash}` };
  } catch (error) {
    console.error("PDF Generation failed:", error);
    throw new Error("Failed to generate compliance document");
  }
}
