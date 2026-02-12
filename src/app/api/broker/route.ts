import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatMessage = { role: "user" | "assistant"; text: string };

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: ChatMessage[];
      context?: {
        liveRates?: Record<string, number>;
        itemSummary?: string;
      };
    };

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.text ?? "";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = [
      "You are UrbanMineAI Broker Agent.",
      "Goal: negotiate a fair deal for an e-waste lot using live rates and grading summary.",
      "Respond conversationally and concisely. Prefer numbers and clear next steps.",
      "When proposing a price, always provide a price-per-kg and a total for the lot, and a short justification.",
      "",
      "Context:",
      body.context?.itemSummary ? `- Item: ${body.context.itemSummary}` : "- Item: (not provided)",
      body.context?.liveRates ? `- LiveRates: ${JSON.stringify(body.context.liveRates)}` : "- LiveRates: (not provided)",
      "",
      "Conversation (most recent last):",
      ...messages.slice(-12).map((m) => `${m.role.toUpperCase()}: ${m.text}`),
      "",
      `USER: ${lastUser}`,
      "ASSISTANT:",
    ].join("\n");

    const streamResult = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Broker error";
    return new Response(msg, { status: 500 });
  }
}

