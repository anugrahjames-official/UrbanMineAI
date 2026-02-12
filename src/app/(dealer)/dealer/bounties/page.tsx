"use client";

import { Button } from "@/components/ui/button";
import { GlassCard, Card } from "@/components/ui/card";
import { Search, Bell, ArrowDown, MapPin, Clock, Zap, Factory, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { getLivePrices } from "@/services/pricing";

type BountyRow = {
  id: string;
  material: string;
  quantity_kg: number;
  price_floor: number | null;
  status: "open" | "filled" | "expired";
  expires_at: string | null;
  created_at: string;
  recycler_id: string;
  min_grade: string | null;
  recycler?: {
    business_name: string | null;
    trust_flags: string[];
    role: string;
  };
};

export default function BountiesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [matchOnly, setMatchMyInventory] = useState(true);
  const [bounties, setBounties] = useState<BountyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avgPremium, setAvgPremium] = useState<number>(8.4);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [prices, bountyRes] = await Promise.all([
          getLivePrices(),
          supabase
            .from("bounties")
            .select("id, material, quantity_kg, price_floor, status, expires_at, created_at, recycler_id, min_grade, recycler:users(business_name, trust_flags, role)")
            .eq("status", "open")
            .order("created_at", { ascending: false })
            .limit(24),
        ]);

        const copper = prices.find((p) => p.symbol === "Cu");
        if (copper) {
          // very rough “premium” proxy for MVP display
          setAvgPremium(Math.max(1, Math.min(25, copper.change + 6)));
        }

        if (mounted) setBounties((bountyRes.data as unknown as BountyRow[]) ?? []);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const visible = matchOnly ? bounties.slice(0, 8) : bounties;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Global Bounties Marketplace</h1>
          <p className="text-gray-400 text-sm mt-1">Live buy requests from recyclers worldwide</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              className="w-full bg-surface-dark border border-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-600"
              placeholder="Search materials..."
            />
          </div>
          <Button variant="secondary" size="icon" className="relative h-11 w-11 rounded-xl">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>
        </div>
      </div>

      {/* Filters & Quick Stats */}
      <section className="space-y-6">
        <GlassCard className="p-4 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 divide-x divide-white/5">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setMatchMyInventory(!matchOnly)}
                className={cn(
                  "w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                  matchOnly ? "bg-primary" : "bg-gray-700"
                )}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", matchOnly ? "left-6" : "left-1")} />
              </div>
              <span className="text-sm font-semibold flex items-center gap-2">
                <Zap size={14} className="text-primary" fill="currentColor" /> Match My Inventory
              </span>
            </div>
            <div className="pl-6 flex items-center gap-3">
              <select className="bg-transparent border-none text-sm font-medium text-gray-400 focus:ring-0 cursor-pointer hover:text-white">
                <option>All Materials</option>
                <option>PCBs (Grade A)</option>
                <option>Li-ion Batteries</option>
              </select>
              <select className="bg-transparent border-none text-sm font-medium text-gray-400 focus:ring-0 cursor-pointer hover:text-white">
                <option>All Regions</option>
                <option>Asia Pacific</option>
                <option>Kerala</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sort by:</span>
            <button className="text-sm font-bold text-primary flex items-center gap-1 hover:brightness-110">
              Highest Premium <ArrowDown size={14} />
            </button>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Volume Needed" value="12,450 kg" trend="+8% vs last week" />
          <StatCard title="Avg. Market Premium" value={`+ ${avgPremium.toFixed(1)}%`} sub="Highest on PCBs" />
          <StatCard title="Matches Found" value={`${Math.min(visible.length, 8)} Opportunities`} action="Review Matches" />
        </div>
      </section>

      {/* Bounty Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {isLoading && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-white/5 bg-surface-dark h-[290px] animate-pulse" />
            ))}
          </>
        )}

        {!isLoading && visible.length === 0 && (
          <GlassCard className="col-span-full border-white/5 text-center py-16">
            <p className="text-gray-400 text-sm">No open bounties yet. Ask a recycler to post a bounty to start matching.</p>
          </GlassCard>
        )}

        {!isLoading &&
          visible.map((b, idx) => {
            const flags = Array.isArray(b.recycler?.trust_flags) ? b.recycler.trust_flags : [];
            const isVerified = flags.includes('verified');
            const companyName = b.recycler?.business_name || `Recycler ${b.recycler_id.slice(0, 4)}`;

            return (
              <BountyCard
                key={b.id}
                isMatch={matchOnly && idx < 3}
                matchPercent={matchOnly && idx < 3 ? `${98 - idx}%` : undefined}
                company={companyName}
                isVerified={isVerified}
                material={b.material}
                sub={`${b.min_grade ? `${b.min_grade} • ` : ""}Min lot ${Number(b.quantity_kg).toFixed(0)}kg`}
                volume={`${Number(b.quantity_kg).toFixed(0)} kg`}
                premium={b.price_floor ? `$${Number(b.price_floor).toFixed(0)}/kg` : "+ Premium"}
                location="Kerala"
                timeLeft={b.expires_at ? "Limited" : "Open"}
              />
            );
          })}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  sub,
  action,
}: {
  title: string;
  value: string;
  trend?: string;
  sub?: string;
  action?: string;
}) {
  return (
    <Card className="relative overflow-hidden group border-white/5 bg-surface-darker">
      <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      {trend && (
        <div className="mt-2 flex items-center text-[10px] font-bold text-primary">
          <Zap size={10} className="mr-1" fill="currentColor" /> {trend}
        </div>
      )}
      {sub && <div className="mt-2 text-[10px] text-success font-bold">{sub}</div>}
      {action && <div className="mt-2 text-[10px] text-primary font-bold cursor-pointer hover:underline flex items-center gap-1">{action} <ArrowDown size={10} className="-rotate-90" /></div>}
    </Card>
  );
}

function BountyCard({
  isMatch,
  matchPercent,
  company,
  isVerified,
  material,
  sub,
  volume,
  premium,
  location,
  timeLeft,
  urgent,
  locked,
}: {
  isMatch?: boolean;
  matchPercent?: string;
  company: string;
  isVerified?: boolean;
  material: string;
  sub: string;
  volume: string;
  premium: string;
  location: string;
  timeLeft: string;
  urgent?: boolean;
  locked?: boolean;
}) {
  return (
    <article className={cn(
      "flex flex-col relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 shadow-sm",
      isMatch ? "border-primary/40 bg-primary/5 shadow-primary/5" : "border-white/5 bg-surface-dark",
      locked && "opacity-70 grayscale pointer-events-none"
    )}>
      {isMatch && (
        <div className="absolute top-0 right-0 bg-primary text-background-dark text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
          AI MATCH: {matchPercent}
        </div>
      )}
      {urgent && (
        <div className="absolute top-0 right-0 bg-error text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm animate-pulse">
          URGENT
        </div>
      )}

      <div className="p-6 flex-1 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            {locked ? <ShieldCheck size={20} className="text-gray-600" /> : <Factory size={20} className="text-gray-400" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white line-clamp-1">{company}</h4>
              {isVerified && <ShieldCheck size={14} className="text-primary shrink-0" fill="currentColor" />}
            </div>
            {isVerified ? (
              <div className="flex items-center text-[10px] text-primary font-bold">
                <ShieldCheck size={10} className="mr-1" /> VERIFIED
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 font-medium">Not Verified Recycler</div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white leading-tight">{material}</h3>
            <p className="text-[10px] text-gray-500 font-medium">{sub}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background-dark p-3 rounded-xl border border-white/5">
              <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1">Volume</p>
              <p className="font-mono text-sm font-bold text-white">{volume}</p>
            </div>
            <div className={cn("p-3 rounded-xl border", isMatch ? "bg-primary/10 border-primary/20" : "bg-surface-darker border-white/5")}>
              <p className={cn("text-[8px] uppercase font-bold tracking-widest mb-1", isMatch ? "text-primary" : "text-gray-500")}>Premium</p>
              <p className={cn("font-mono text-sm font-bold", isMatch ? "text-primary" : "text-white")}>{premium}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold border-t border-white/5 pt-4">
            <span className="flex items-center gap-1.5 uppercase tracking-wider"><MapPin size={12} /> {location}</span>
            <span className="flex items-center gap-1.5 uppercase tracking-wider"><Clock size={12} /> {timeLeft}</span>
          </div>
        </div>

        <div className="p-6 pt-0 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" className="h-10 text-[10px] font-bold border-white/5">Details</Button>
          <Button size="sm" className={cn("h-10 text-[10px] font-bold shadow-sm", locked && "bg-gray-700")}>
            {locked ? "Locked" : "Accept Deal"}
          </Button>
        </div>
      </div>
    </article>
  );
}
