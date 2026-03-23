import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { messages, transactionId } = await req.json();

    if (!transactionId) {
        return new Response('Transaction ID is required', { status: 400 });
    }

    // Fetch Transaction Context
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select(`
      *,
      items (*)
    `)
        .eq('id', transactionId)
        .single();

    if (txError || !transaction) {
        return new Response('Transaction not found', { status: 404 });
    }

    // Fetch Market Prices (optional, for context)
    const { data: marketPrices } = await supabase
        .from('market_prices')
        .select('*');

    // Construct System Context
    const item = transaction.items?.[0] || {}; // Assuming single item for now or handling arrays
    const itemMetadata = item.metadata as any || {};

    const systemContext = `
    You are the "UrbanMine AI Broker", an autonomous negotiation agent for e-waste recycling.
    You are negotiating with a Dealer (User) on behalf of a Recycler/Aggregator hub.

    **Transaction Context:**
    - Item: ${itemMetadata.category || 'Unknown E-waste'}
    - Weight: ${itemMetadata.weight || 'Unknown'}
    - Grade: ${itemMetadata.grade || 'Ungraded'}
    - Current Price Offer: $${transaction.price_total}
    - Status: ${transaction.status}

    **Market Context:**
    ${marketPrices?.map(p => `- ${p.name} (${p.symbol}): $${p.price}/${p.unit}`).join('\n') || 'Market data unavailable.'}

    **Goals:**
    1. Negotiate a fair price for the e-waste based on grade and market rates.
    2. If the user offers a price comfortably within margin (e.g. +/- 10% of current offer), accept it using 'update_price'.
    3. If the user agrees to the price, finalize the deal using 'close_deal'.
    4. Be professional, concise, and use data to back up your arguments.
    5. Do not hallucinate values. Use the provided context.

    **Tone:** Professional, Efficient, "Eco-Futuristic".
  `;

    // Persist User Message (AI SDK 5: extract text from the last message's parts)
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
        const textContent: string = Array.isArray(lastUserMessage.parts)
            ? lastUserMessage.parts
                .filter((p: { type: string }) => p.type === 'text')
                .map((p: { type: 'text'; text: string }) => p.text)
                .join('')
            : (lastUserMessage.content ?? '');
        if (textContent) {
            await supabase.from('messages').insert({
                transaction_id: transactionId,
                role: 'user',
                content: textContent,
            });
        }
    }

    // Convert UIMessages to ModelMessages for streamText
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
        model: google('gemini-1.5-flash'),
        system: systemContext,
        messages: modelMessages,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: {
            update_price: {
                description: 'Update the proposed price for the transaction.',
                parameters: z.object({
                    price: z.number().describe('The new price value in USD.'),
                    reason: z.string().describe('Reason for the price update.'),
                }),
                execute: async ({ price, reason }: { price: number; reason: string }) => {
                    const { error } = await supabase
                        .from('transactions')
                        .update({ price_total: price })
                        .eq('id', transactionId);
                    if (error) throw new Error('Failed to update price');
                    return `Price updated to $${price}. Reason: ${reason}`;
                },
            },
            close_deal: {
                description: 'Finalize the deal and mark it as agreed.',
                parameters: z.object({
                    final_price: z.number().describe('The final agreed price.'),
                }),
                execute: async ({ final_price }: { final_price: number }) => {
                    const { error } = await supabase
                        .from('transactions')
                        .update({ price_total: final_price, status: 'agreed' })
                        .eq('id', transactionId);
                    if (error) throw new Error('Failed to close deal');
                    return `Deal finalized at $${final_price}. Please proceed to payment/logistics.`;
                },
            },
        } as any,
        onFinish: async ({ text }: { text: string }) => {
            // Persist Assistant Message
            if (text) {
                await supabase.from('messages').insert({
                    transaction_id: transactionId,
                    role: 'assistant',
                    content: text,
                });
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
