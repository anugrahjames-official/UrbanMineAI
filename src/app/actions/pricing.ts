"use server";

import { createClient } from "@/lib/supabase/server";

export interface MaterialPrice {
    name: string;
    symbol: string;
    price: number;
    unit: string;
    change: number;
}

export async function getLivePrices(): Promise<MaterialPrice[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        // 1. Get unique materials from user's bounties
        const { data: userBounties } = await supabase
            .from('bounties')
            .select('material')
            .eq('recycler_id', user.id);

        if (!userBounties || userBounties.length === 0) {
            return [];
        }

        const uniqueMaterials = Array.from(new Set(userBounties.map(b => b.material.toLowerCase())));

        // 2. Fetch ALL cached prices (small dataset)
        let { data: cachedPrices, error } = await supabase
            .from('market_prices')
            .select('name, symbol, price, unit, change, last_updated');

        // 3. If cache is empty or stale (older than 1 hour), fetch fresh data
        const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
        const hasStaleData = !cachedPrices || cachedPrices.length === 0 || cachedPrices.some(p => p.last_updated < oneHourAgo);

        if (hasStaleData) {
            const { fetchAndCacheMetalPrices } = await import('@/services/metals');
            await fetchAndCacheMetalPrices();

            // Re-fetch from cache
            const res = await supabase
                .from('market_prices')
                .select('name, symbol, price, unit, change, last_updated')
                .order('change', { ascending: false });

            cachedPrices = res.data;
        }

        if (!cachedPrices) return [];

        // 4. Fuzzy Match: Return metal if ANY user material contains the metal name
        // e.g. "Gold Plated Pins" contains "Gold"
        const relevantPrices = cachedPrices.filter(metal => {
            const metalName = metal.name.toLowerCase();
            return uniqueMaterials.some(userMat => userMat.includes(metalName));
        });

        // If fuzzy match finds nothing but user HAS bounties, maybe fallback to showing top 3 movers?
        // For now, let's strictly return matches to encourage accurate naming, OR return relevantPrices.
        // If relevantPrices is empty, it means we have bounties but none match our known metals.
        // Let's rely on the fuzzy match. 

        return relevantPrices as MaterialPrice[];

    } catch (error) {
        console.error("Failed to fetch personalized live prices:", error);
        return [];
    }
}
