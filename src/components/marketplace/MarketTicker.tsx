'use client';

import { createClient } from '@/lib/supabase/client'; // Client-side client
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exists

interface TickerItem {
    symbol: string;
    name: string;
    price: number;
    currency: string;
    unit: string;
    change: number;
}

interface MarketTickerProps {
    initialData: TickerItem[];
    userRole?: string;
}

export default function MarketTicker({ initialData, userRole }: MarketTickerProps) {
    const [prices, setPrices] = useState<TickerItem[]>(initialData);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to real-time changes
        const channel = supabase
            .channel('market-prices-ticker')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'market_prices'
                },
                (payload: any) => {
                    const updatedPrice = payload.new as TickerItem;
                    setPrices((current) =>
                        current.map(p => p.symbol === updatedPrice.symbol ? updatedPrice : p)
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-white/10 bg-[#112117]/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-white/90 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Live Market Ticker
                </h3>
                <span className="text-[10px] text-white/40">LME Updated</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                {prices.map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-xs text-white/50 font-medium">{item.name} ({item.symbol})</span>
                            <span className="text-sm font-bold text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price)}
                                <span className="text-[10px] font-normal text-white/50">/{item.unit}</span>
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={cn(
                                "text-xs flex items-center gap-1",
                                item.change >= 0 ? "text-[#19e66b]" : "text-red-400"
                            )}>
                                {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {item.change > 0 ? '+' : ''}{item.change}%
                            </span>
                        </div>
                    </div>
                ))}
                {prices.length === 0 && (
                    <div className="p-3 text-center text-white/40 text-xs">Waiting for data...</div>
                )}
            </div>
        </div>
    );
}
