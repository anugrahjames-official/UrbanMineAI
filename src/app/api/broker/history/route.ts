
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
        return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access to transaction (supplier or buyer)
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('supplier_id, buyer_id')
        .eq('id', transactionId)
        .single();

    if (txError || !transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.supplier_id !== user.id && transaction.buyer_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json(messages);
}
