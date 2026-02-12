import { generateForm6 } from "@/services/compliance";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    transactionId?: string;
    supplierName?: string;
    buyerName?: string;
    materialType?: string;
    weightKg?: number;
    date?: string;
  };

  const { pdfBytes, hash } = await generateForm6({
    transactionId: body?.transactionId ?? "TXN-DEMO-8839",
    supplierName: body?.supplierName ?? "Dealer (Demo)",
    buyerName: body?.buyerName ?? "Recycler/OEM (Demo)",
    materialType: body?.materialType ?? "Mixed PCB",
    weightKg: Number(body?.weightKg ?? 500),
    date: body?.date ?? new Date().toISOString().slice(0, 10),
  });

  return new Response(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="UrbanMineAI-Form6-${body?.transactionId ?? "DEMO"}.pdf"`,
      "X-Document-Hash": hash,
      "Cache-Control": "no-store",
    },
  });
}

