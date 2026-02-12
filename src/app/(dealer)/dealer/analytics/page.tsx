

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from "lucide-react";

import { getDealerAnalytics } from "@/app/actions/dealer";

export default async function DealerAnalyticsPage() {
  const stats = await getDealerAnalytics();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Sales & Analytics</h1>
        <p className="text-sm text-gray-400">Quick market insight and performance snapshots for your inventory.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">This Week GMV</p>
              <p className="text-3xl font-bold mt-2">
                {stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.inventoryValue) : "$0"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <TrendingUp className="text-primary" size={18} />
            </div>
          </div>
          <div className="mt-4">
            {/* Trend logic would go here if we had historical data */}
            <StatusBadge variant="success"> Live Data </StatusBadge>
          </div>
        </Card>

        <Card className="border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Avg. Deal Time</p>
              <p className="text-3xl font-bold mt-2">{stats?.avgDealTime || "N/A"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Activity className="text-gray-300" size={18} />
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge variant="primary">Calculating...</StatusBadge>
          </div>
        </Card>

        <Card className="border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Rejected Lots</p>
              <p className="text-3xl font-bold mt-2">{stats?.rejectedCount || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center border border-error/20">
              <TrendingDown className="text-error" size={18} />
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge variant={stats?.rejectedCount && stats.rejectedCount > 0 ? "error" : "success"}>
              {stats?.rejectedCount && stats.rejectedCount > 0 ? "Action Needed" : "All Good"}
            </StatusBadge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" /> Weekly Revenue
            </h2>
            <StatusBadge variant="primary">Live</StatusBadge>
          </div>
          <div className="h-52 flex items-end gap-3 justify-center items-center">
            {/* Placeholder for no data state if all 0 */}
            {stats?.weeklyRevenue.every((v) => v === 0) ? (
              <p className="text-gray-500 text-sm">No revenue data for this week yet.</p>
            ) : (
              stats?.weeklyRevenue.map((h, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-primary/20" style={{ height: `${h > 0 ? h : 4}px` }} /> {/* Simple height logic for now */}
                  <span className="text-[10px] text-gray-500 font-bold">{stats.weeklyLabels[i]}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PieChart size={18} className="text-primary" /> Composition
            </h2>
            <StatusBadge variant="primary">Inventory</StatusBadge>
          </div>
          <div className="space-y-3">
            {stats && stats.composition.length > 0 ? (
              stats.composition.map((c: { label: string; value: string }) => (
                <Row key={c.label} label={c.label} value={c.value} />
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No inventory data available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

