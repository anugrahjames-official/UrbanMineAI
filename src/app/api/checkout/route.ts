import { NextResponse } from "next/server";
import { calculateCommission, createCheckoutSession } from "@/services/stripe";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { grossAmount?: number; transactionId?: string };
    const grossAmount = Number(body.grossAmount);
    const transactionId = String(body.transactionId || "");

    if (!grossAmount || grossAmount <= 0 || !transactionId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { net, commission } = calculateCommission(grossAmount);
    const session = await createCheckoutSession(net, transactionId);

    return NextResponse.json({ session, net, commission });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Checkout error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

