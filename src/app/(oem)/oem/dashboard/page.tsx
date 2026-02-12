
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

import { getOEMComplianceStats, getComplianceLogs } from "@/app/actions/oem";
import { formatDistanceToNow } from "date-fns";

interface ComplianceLog {
  id: string;
  created_at: string;
  status: string;
  metadata: {
    category?: string;
    quantity?: number;
  } | null;
}

export default async function OEMDashboard() {
  const stats = await getOEMComplianceStats();
  const logs = await getComplianceLogs();

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">OEM Global Compliance Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Fiscal Year 2026-27 • Global Operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-bold border border-warning/20">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            Deadline Approaching: Oct 31
          </span>
          <Button className="gap-2 h-11 shadow-glow-primary font-bold">
            <Icons.Download size={18} /> Export Summary
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 bg-surface-dark border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 transition-all group-hover:bg-primary/10" />
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Overall Compliance Status</p>
              <h3 className="text-5xl font-bold text-white">{stats?.compliancePercentage || 0}% <span className="text-xl font-medium text-gray-500">Complete</span></h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                You have acquired {stats?.creditsAcquired || 0} kg of credits.
              </p>
            </div>
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="transform -rotate-90 w-full h-full">
                <circle className="text-white/5" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="10" />
                <circle className="text-primary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301.6" strokeDashoffset={`${301.6 - (301.6 * (stats?.compliancePercentage || 0)) / 100}`} strokeLinecap="round" strokeWidth="10" />
              </svg>
              <Icons.ShieldCheck className="absolute text-primary" size={32} />
            </div>
          </div>
          <div className="mt-8 w-full bg-white/5 rounded-full h-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/20 blur-sm" style={{ width: `${stats?.compliancePercentage || 0}%` }} />
            <div className="bg-primary h-2 rounded-full relative" style={{ width: `${stats?.compliancePercentage || 0}%` }} />
          </div>
        </div>

        <StatCard
          title="Pending Verification"
          value={`${stats?.pendingVerification || 0} Batches`}
          icon={<Icons.Hourglass size={20} className="text-warning" />}
          sub="awaiting audit"
          status={stats?.pendingVerification && stats.pendingVerification > 0 ? "warning" : undefined}
        />
        <StatCard
          title="Est. Cost Savings"
          value={`$${(stats?.savings ? (stats.savings / 1000).toFixed(1) : 0)}K`}
          icon={<Icons.TrendingUp size={20} className="text-primary" />}
          sub="vs Traditional Sourcing"
          trend
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Credit Velocity Chart Placeholder */}
        <Card className="lg:col-span-2 border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">EPR Credit Velocity</h3>
            <select className="bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-gray-400 rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer">
              <option>Last 6 Months</option>
              <option>Fiscal Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-surface-dark/30">
            <p className="text-sm text-gray-500">Not enough data for visualization.</p>
          </div>
        </Card>

        {/* Purchase Tool */}
        <Card className="border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Icons.RefreshCw size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Purchase Credits</h3>
              <p className="text-[10px] text-gray-500 font-medium">Instant trade execution</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Waste Category</label>
              <select className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-gray-300 focus:ring-1 focus:ring-primary outline-none">
                <option>Li-ion Batteries</option>
                <option>Consumer Electronics</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Quantity (kg)</label>
              <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="p-4 bg-background-dark/50 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-500 uppercase tracking-widest">Market Rate</span>
                <span className="text-white">$0.15 / kg</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                <span className="text-gray-500">Total Est.</span>
                <span className="text-primary">$ 0.00</span>
              </div>
            </div>
            <Button className="w-full py-7 font-bold shadow-glow-primary">Execute Trade</Button>
            <p className="text-center text-[8px] text-gray-600 font-medium">* Trades subject to real-time audit verification.</p>
          </div>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="p-0 border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold flex items-center gap-3">
            Compliance Audit Logs
            <StatusBadge variant="primary" className="text-[8px] bg-white/5 border-white/10 text-gray-500">Recent Activity</StatusBadge>
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary w-64" placeholder="Search Batch ID..." />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9 border-white/10"><Icons.Filter size={16} /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">Waste Category</th>
                <th className="px-6 py-4">Credits (kg)</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {logs.length > 0 ? (
                logs.map((log: ComplianceLog) => (
                  <LogRow
                    key={log.id}
                    date={formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    id={log.id.substring(0, 8)}
                    cat={log.metadata?.category || "Unknown"}
                    qty={log.metadata?.quantity?.toString() || "0"}
                    status={log.status === "verified" ? "verified" : "pending"}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  sub,
  status,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  status?: "warning";
  trend?: boolean;
}) {
  return (
    <Card className="flex flex-col justify-between border-white/5 p-6 hover:border-primary/20 transition-all group">
      <div className="flex justify-between items-start">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</p>
        <div className={cn("p-2 rounded-lg border", status === 'warning' ? "bg-warning/10 border-warning/20" : "bg-primary/10 border-primary/20")}>
          {icon}
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        <p className={cn("text-[10px] font-bold", status === 'warning' ? "text-warning" : "text-primary")}>
          {trend && <Icons.TrendingUp size={10} className="inline mr-1" />} {sub}
        </p>
      </div>
    </Card>
  );
}

function LogRow({
  date,
  id,
  cat,
  qty,
  status,
}: {
  date: string;
  id: string;
  cat: string;
  qty: string;
  status: "verified" | "pending";
}) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="px-6 py-4 text-gray-400">{date}</td>
      <td className="px-6 py-4 font-mono text-white">{id}</td>
      <td className="px-6 py-4 text-white">{cat}</td>
      <td className="px-6 py-4 font-bold text-white">{qty}</td>
      <td className="px-6 py-4 text-center">
        <StatusBadge variant={status === 'verified' ? 'success' : 'warning'}>
          {status}
        </StatusBadge>
      </td>
      <td className="px-6 py-4 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary"><Icons.FileText size={16} /></Button>
      </td>
    </tr>
  );
}