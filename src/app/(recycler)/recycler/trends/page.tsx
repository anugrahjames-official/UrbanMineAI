"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icons } from "@/components/icons";
import { getLivePrices, type MaterialPrice } from "@/services/pricing";
import { useEffect, useState } from "react";

export default function RecyclerTrendsPage() {
  const [prices, setPrices] = useState<MaterialPrice[]>([]);

  useEffect(() => {
    getLivePrices().then(setPrices);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Market Trends</h1>
        <p className="text-sm text-gray-400">Live rates feed for procurement decisions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prices.length > 0 ? (
          prices.map((p) => (
            <Card key={p.symbol} className="border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-gray-500">{p.symbol}</p>
                </div>
                <StatusBadge variant={p.change >= 0 ? "success" : "warning"}>
                  {p.change >= 0 ? "+" : ""}{p.change}%
                </StatusBadge>
              </div>
              <p className="mt-3 text-2xl font-bold text-primary font-mono">
                ${Number(p.price).toFixed(2)}
                <span className="text-sm text-gray-500 font-normal">/{p.unit}</span>
              </p>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-darker/30 rounded-3xl border border-white/5 border-dashed text-center">
            <Icons.TrendingUp className="text-gray-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Personalize Your Feed</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
              We only show market trends for materials you actively procure. Create your first bounty to start tracking live prices.
            </p>
            <Button size="lg" className="font-bold shadow-glow-primary px-8" asChild>
              <Link href="/recycler/procurement">Create First Bounty</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

