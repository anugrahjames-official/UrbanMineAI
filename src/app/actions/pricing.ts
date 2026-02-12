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

        const uniqueMaterials = Array.from(new Set(userBounties.map(b => b.material)));

        // 2. Fetch prices for these materials
        const { data, error } = await supabase
            .from('market_prices')
            .select('name, symbol, price, unit, change')
            .in('name', uniqueMaterials)
            .order('change', { ascending: false });

        if (error) throw error;

        return (data || []) as MaterialPrice[];
    } catch (error) {
        console.error("Failed to fetch personalized live prices:", error);
        return [];
    }
}
