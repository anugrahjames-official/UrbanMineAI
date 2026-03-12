import { NextResponse } from 'next/server';
import { fetchAndCacheMetalPrices } from '@/services/metals';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check session/auth if needed, or keep it open for quick debugging
        const { data: { user } } = await supabase.auth.getUser();

        console.log('Starting manual metal price fetch...');
        await fetchAndCacheMetalPrices();

        // Verify cache
        const { data: cached } = await supabase
            .from('market_prices')
            .select('*')
            .order('last_updated', { ascending: false });

        return NextResponse.json({
            status: 'success',
            message: 'Metal prices fetched and cached',
            user: user?.email || 'unauthenticated',
            cachedCount: cached?.length || 0,
            latest: cached?.[0] || null
        });
    } catch (error: any) {
        console.error('Debug Route Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
