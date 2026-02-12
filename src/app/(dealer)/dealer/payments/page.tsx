"use client";

import { Button } from "@/components/ui/button";
import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { calculateCommission } from "@/services/stripe";

export default function PaymentsPage() {
  const [isPaying, setIsPaying] = useState(false);
  const demoGross = 45000;
  const { net, commission } = calculateCommission(demoGross);

  async function payDemo() {
    setIsPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grossAmount: demoGross, transactionId: "TXN-DEMO-8839" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create checkout session");
      window.open(json.session.url, "_blank", "noopener,noreferrer");
    } catch {
      // no-op for MVP UI
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Global Financial Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your international earnings, payouts, and settlement history.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2 border-white/5 bg-surface-dark h-11">
            <Icons.Download size={18} /> Export Report
          </Button>
          <Button className="gap-2 h-11 shadow-glow-primary font-bold" onClick={payDemo} disabled={isPaying}>
            <Icons.Wallet size={18} /> Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Earnings (Gross)"
          value="$124,590.00"
          trend="+12.5%"
          icon={<Icons.Banknote className="text-primary" size={24} />}
        />
        <MetricCard
          title="Platform Fees (10%)"
          value={`$${commission.toFixed(0)}`}
          sub="Fixed 10% commission applied on all deals."
          icon={<Icons.PieChart className="text-orange-400" size={24} />}
        />
        <GlassCard className="relative overflow-hidden group border-primary/20 bg-surface-darker">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative flex flex-col h-full justify-between z-10 space-y-4">
            <div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Available for Payout</p>
              <h3 className="text-4xl font-bold text-white mt-2">${net.toFixed(0)}</h3>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-gray-400 uppercase tracking-widest">Next auto-settlement: <span className="text-white">Oct 24</span></span>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Recent Transactions</h2>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-9 text-[10px] border-white/5">
                  <Icons.Calendar size={14} className="mr-2" /> Filter by date
                </Button>
                <Button variant="secondary" size="sm" className="h-9 text-[10px] border-white/5">
                  <Icons.Filter size={14} className="mr-2" /> Status
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Counterparty</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  <TransactionRow
                    id="#TXN-8839"
                    desc="500kg PCB"
                    date="Oct 22, 2023"
                    buyer="Global Green Cycle Ltd."
                    region="Europe"
                    gross="$45,000"
                    fee="-$4,500"
                    status="processing"
                    icon={<Icons.Memory size={18} className="text-primary" />}
                  />
                  <TransactionRow
                    id="#TXN-8838"
                    desc="120kg Li-Ion"
                    date="Oct 20, 2023"
                    buyer="PacRim E-Waste"
                    region="Asia Pacific"
                    gross="$12,400"
                    fee="-$1,240"
                    status="paid"
                    icon={<Icons.Smartphone size={18} className="text-blue-400" />}
                  />
                  <TransactionRow
                    id="#TXN-8835"
                    desc="2T Mixed Copper"
                    date="Oct 18, 2023"
                    buyer="EcoMetal Global"
                    region="North America"
                    gross="$115,000"
                    fee="-$11,500"
                    status="paid"
                    icon={<Icons.Cable size={18} className="text-orange-400" />}
                  />
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 text-center">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold text-gray-500 hover:text-primary">
                View All Transactions
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-6">
          <Card className="border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <Icons.Settings size={16} className="text-primary" /> Payout Settings
              </h3>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Edit</button>
            </div>

            <div className="space-y-3">
              <PayoutMethod
                active
                title="Chase Bank (USD)"
                sub="Primary Account"
                acc="**** 1234"
              />
              <PayoutMethod
                title="International Wire"
                sub="SWIFT: CHSUS33..."
              />
              <Button variant="secondary" className="w-full border-dashed border-white/10 text-[10px] font-bold h-11">
                + Add Payment Method
              </Button>
            </div>
          </Card>

          <GlassCard className="text-center space-y-4 border-primary/10">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Icons.ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-sm">Secure Global Payments</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Your financial data is encrypted and secure. UrbanMineAI partners with top-tier international gateways.
            </p>
            <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Security Policy</button>
          </GlassCard>

          <Card className="flex items-center gap-4 border-white/5 p-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
              <Icons.SupportAgent size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Need help?</p>
              <p className="text-[10px] text-gray-500">Contact Global Support</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  sub,
  icon,
}: {
  title: string;
  value: string;
  trend?: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden group border-white/5 hover:border-primary/20 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="flex flex-col h-full justify-between space-y-4">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className="flex items-center text-[10px] font-bold">
          {trend ? (
            <span className="text-success bg-success/10 px-2 py-0.5 rounded-md flex items-center mr-2">
              <Icons.Zap size={10} className="mr-1" fill="currentColor" /> {trend}
            </span>
          ) : null}
          <span className="text-gray-500 uppercase tracking-widest">{sub || "vs last month"}</span>
        </div>
      </div>
    </Card>
  );
}

function TransactionRow({
  id,
  desc,
  date,
  buyer,
  region,
  gross,
  fee,
  status,
  icon,
}: {
  id: string;
  desc: string;
  date: string;
  buyer: string;
  region: string;
  gross: string;
  fee: string;
  status: "processing" | "paid" | "failed";
  icon: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            {icon}
          </div>
          <div>
            <p className="font-bold text-white">{id}</p>
            <p className="text-[10px] text-gray-500">{date} • {desc}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-bold text-white">{buyer}</p>
        <p className="text-[10px] text-gray-500">{region}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-bold text-white">{gross}</p>
        <p className="text-[10px] text-error font-bold">{fee} Fee</p>
      </td>
      <td className="px-6 py-4 text-center">
        <StatusBadge variant={status === 'paid' ? 'success' : 'warning'}>
          {status}
        </StatusBadge>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-gray-500 hover:text-white transition-colors">
          <Icons.MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
}

function PayoutMethod({
  title,
  sub,
  acc,
  active,
}: {
  title: string;
  sub: string;
  acc?: string;
  active?: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all cursor-pointer",
      active ? "bg-primary/5 border-primary/30" : "bg-white/5 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <Icons.Wallet size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{title}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
            {acc && <p className="text-xs font-mono text-gray-400 mt-2 tracking-widest">{acc}</p>}
          </div>
        </div>
        {active && <StatusBadge variant="success" className="h-5 w-5 p-0 rounded-full flex items-center justify-center"><Icons.ShieldCheck size={10} /></StatusBadge>}
      </div>
    </div>
  );
}
