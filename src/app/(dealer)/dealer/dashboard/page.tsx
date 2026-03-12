import { Button } from "@/components/ui/button";
import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Camera, Wallet, Handshake, History, ArrowRight, Zap, MoreVertical, PackageX } from "lucide-react";
import Link from "next/link";
import { getDealerAnalytics, getRecentDealerInventory, getDealerProfile } from "@/app/actions/dealer";
import { formatDistanceToNow } from 'date-fns';
import { TrustScoreCard } from "@/components/trust/TrustScoreCard";
import { TrustHistoryList } from "@/components/trust/TrustHistoryList";
import { getUserProfile } from "@/app/actions/user";

interface DealerInventoryItem {
  id: string;
  title: string;
  weight: string;
  value: string | number;
  grade: string;
  created_at: string;
  image: string;
}

export default async function DealerDashboard() {
  const stats = await getDealerAnalytics();
  const recentInventory = (await getRecentDealerInventory()) as DealerInventoryItem[];
  const profile = await getDealerProfile();
  // We need the ID for history, getDealerProfile might not return ID if I didn't add it.
  // Actually getDealerProfile calls getUserProfile which has ID but getDealerProfile filters fields.
  // Let's check dealer.ts again. It returns name, email, trustScore, trustFlags, tier.
  // I need the userID for TrustHistoryList.
  const userFullProfile = await getUserProfile();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Trust Score Section - Prominent at top */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-4 lg:col-span-4">
          <TrustScoreCard
            score={profile.trustScore}
            tier={profile.tier || 'Newbie'}
            trustFlags={profile.trustFlags}
          />
        </div>
        <div className="col-span-1 md:col-span-8 lg:col-span-8">
          {/* Quick Actions & Metrics moved here or kept below? 
                   Let's keep the Scan CTA here for easy access next to trust score.
               */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Re-using the Scan CTA logic but fitting it here */}
            <Link href="/dealer/scan" className="h-full">
              <div className="h-full bg-gradient-to-br from-primary to-green-600 rounded-2xl p-6 relative overflow-hidden group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex flex-col justify-between min-h-[160px]">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Camera className="text-white" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-background-dark">Quick Scan</h3>
                  </div>
                  <p className="text-background-dark/80 text-sm font-medium">Grade waste instantly with AI</p>
                </div>
                <div className="relative z-10 mt-auto w-full py-2 bg-background-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:gap-3 transition-all text-sm">
                  Start Camera <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Maybe another quick action or just leave it */}
          </div>
        </div>
      </div>

      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Metrics */}
        <div className="col-span-1 md:col-span-12 lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Inventory Value"
            value={stats ? formatCurrency(stats.inventoryValue) : "$0"}
            trend={stats && stats.inventoryValue > 0 ? "+12%" : undefined}
            icon={<Wallet className="text-blue-400" size={20} />}
          />
          <MetricCard
            title="Active Deals"
            value={stats ? stats.activeDeals.toString() : "0"}
            sub="in negotiation"
            icon={<Handshake className="text-orange-400" size={20} />}
          />
          <MetricCard
            title="Scanned Today"
            value={stats ? stats.scannedToday.toString() : "0"}
            sub="items"
            icon={<History className="text-purple-400" size={20} />}
          />
          <MetricCard
            title="Avg Score Change"
            value="0"
            sub="last 30 days"
            icon={<Zap className="text-yellow-400" size={20} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inventory (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              My Inventory
              <span className="text-xs font-normal text-gray-400 bg-surface-darker px-2 py-1 rounded-md border border-white/5">Recent Scans</span>
            </h3>
            <Link href="/dealer/inventory" className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          {recentInventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentInventory.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  title={item.title}
                  weight={item.weight}
                  value={item.value.toString()}
                  grade={item.grade}
                  time={formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  image={item.image}
                  variant={item.grade?.includes('A') ? 'success' : item.grade?.includes('B') ? 'warning' : 'error'}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-surface-darker/50 rounded-2xl border border-white/5 border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <PackageX className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white">No items found</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Start scanning e-waste to build your inventory.</p>
              <Link href="/dealer/scan">
                <Button>Scan First Item</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Trust History Sidebar (1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-bold">Reputation Log</h3>
          <TrustHistoryList userId={userFullProfile.id} />
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
  className,
}: {
  title: string;
  value: string;
  trend?: string;
  sub?: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`flex flex-col justify-between hover:border-primary/30 transition-colors group p-5 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-md flex items-center">
            <Zap size={10} className="mr-1" fill="currentColor" /> {trend}
          </span>
        )}
        {sub && !trend && (
          <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-md">
            {sub}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-semibold">{title}</p>
        <h4 className="text-2xl lg:text-3xl font-bold">{value}</h4>
      </div>
    </Card>
  );
}

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info";

function InventoryItemCard({
  title,
  weight,
  value,
  grade,
  time,
  image,
  variant = "primary",
}: {
  title: string;
  weight: string;
  value: string;
  grade: string;
  time: string;
  image: string;
  variant?: BadgeVariant;
}) {
  return (
    <GlassCard className="p-0 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border-white/5">
      <div className="relative h-40 bg-surface-darker">
        <img src={image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={title} />
        <div className="absolute top-3 left-3">
          <StatusBadge variant={variant}>{grade}</StatusBadge>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background-dark to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">{time} • {weight}</p>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Est. Value / kg</p>
            <p className="text-lg font-bold text-primary">{value}</p>
          </div>
          <Button variant="primary" size="sm" className="h-8 w-8 p-0 rounded-lg">
            <Handshake size={14} />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
