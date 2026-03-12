import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { getRecyclerDashboardStats, getMarketplaceItems } from "@/app/actions/recycler";
import { getLivePrices } from "@/services/pricing";
import { formatDistanceToNow } from 'date-fns';
import BidButton from "@/components/recycler/BidButton";

interface MarketplaceItemData {
  id: string;
  shortId: string;
  title: string;
  location: string;
  weight: string;
  value: string | number;
  created_at: string;
  grade: string;
  image: string;
  composition: Array<{ name: string; value: string; percentage: number }>;
}

export default async function RecyclerDashboard() {
  const stats = await getRecyclerDashboardStats();
  const marketplaceItems = (await getMarketplaceItems()) as MarketplaceItemData[];
  const prices = await getLivePrices();

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Bids"
          value={stats?.activeBids.toString() || "0"}
          icon={<Icons.Gavel className="text-primary" size={20} />}
          trend=""
          trendSub="in progress"
        />
        <SummaryCard
          title="Lots Won Today"
          value={stats?.lotsWonToday.toString() || "0"}
          icon={<Icons.CheckCircle className="text-success" size={20} />}
          sub="Verified deals"
        />
        <SummaryCard
          title="Pending Delivery"
          value={stats?.pendingDelivery.toString() || "0"}
          icon={<Icons.LocalShipping className="text-warning" size={20} />}
          sub="awaiting logistics"
        />
        <SummaryCard
          title="Capital Deployed"
          value={stats?.capitalDeployed ? `$${stats.capitalDeployed.toLocaleString()}` : "$0"}
          icon={<Icons.Wallet className="text-blue-400" size={20} />}
          trend=""
          trendColor="text-error"
          trendSub="total deployed"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Bidding Interface */}
        <div className="xl:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Icons.Star className="text-warning fill-warning" size={18} /> Premium Upcoming Lots
              </h2>
              <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View All</button>
            </div>

            {/* Show top 2 marketplace items as premiums if available, else empty state */}
            {marketplaceItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplaceItems.slice(0, 2).map((item) => (
                  <LotCard
                    key={item.id}
                    id={item.shortId}
                    fullId={item.id}
                    title={item.title}
                    desc={`${item.weight} at ${item.location}. Grade: ${item.grade}`}
                    grade={item.grade}
                    value={item.value.toString()}
                    time={formatDistanceToNow(new Date(item.created_at))}
                    image={item.image}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface-darker/50 border border-white/5 border-dashed rounded-xl p-8 text-center text-gray-500 text-sm">
                No active lots available at the moment.
              </div>
            )}
          </section>

          <Card className="p-0 border-white/5 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/5 flex flex-wrap gap-3 items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Live Marketplace</h2>
                <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold rounded-md animate-pulse">LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <select className="bg-surface-dark border-white/10 text-xs rounded-lg py-1.5 pl-2 pr-8 focus:ring-primary focus:border-primary">
                  <option>All Materials</option>
                  <option>PCB</option>
                </select>
                <Button variant="secondary" size="sm" className="h-8 text-[10px] border-white/10">
                  <Icons.Filter size={14} className="mr-1" /> More
                </Button>
              </div>
            </div>
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="min-w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest sticky top-0 z-10 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Batch Info</th>
                    <th className="px-6 py-4">Composition</th>
                    <th className="px-6 py-4">Weight</th>
                    <th className="px-6 py-4">Current Value</th>
                    <th className="px-6 py-4">Listed</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {marketplaceItems.length > 0 ? (
                    marketplaceItems.map((item) => (
                      <MarketRow
                        key={item.id}
                        id={item.id}
                        shortId={item.shortId}
                        title={item.title}
                        loc={item.location}
                        weight={item.weight}
                        bid={item.value.toString()}
                        time={formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        comp={item.composition}
                        icon={<Icons.Cable size={18} className="text-gray-400" />} // Default icon
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No live listings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Analytics & Tools */}
        <div className="space-y-6">
          <Card className="border-white/5 p-6 h-48 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Feedstock Trends</h3>
              <Link href="/recycler/trends" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View All</Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
              {prices.length > 0 ? (
                prices.slice(0, 3).map((p) => (
                  <div key={p.symbol} className="flex items-center justify-between group/trend">
                    <div>
                      <p className="text-xs font-bold text-white group-hover/trend:text-primary transition-colors">{p.name}</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-tighter">{p.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white font-mono">${p.price}<span className="text-[10px] text-gray-500 font-normal ml-0.5">/{p.unit}</span></p>
                      <span className={cn(
                        "text-[9px] font-bold flex items-center justify-end",
                        p.change >= 0 ? "text-success" : "text-error"
                      )}>
                        {p.change >= 0 ? <Icons.TrendingUp size={10} className="mr-0.5" /> : <Icons.TrendingDown size={10} className="mr-0.5" />}
                        {Math.abs(p.change)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-surface-dark/50 rounded-xl border border-white/5 border-dashed p-4 text-center">
                  <Icons.TrendingUp className="text-gray-600 mb-2" size={20} />
                  <p className="text-[10px] text-gray-400 mb-2 max-w-[150px]">No materials tracked yet. Create a procurement bounty to track prices.</p>
                  <Button variant="ghost" size="sm" className="h-6 text-[8px] font-bold text-primary px-3 bg-primary/5 hover:bg-primary/10 border border-primary/20" asChild>
                    <Link href="/recycler/procurement">Create Bounty</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="bg-surface-dark rounded-2xl border border-white/5 p-0 overflow-hidden relative h-48 group cursor-pointer">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7-GCBpqA-bXvgQWZGqyShWVF-EKsx71m4p-luaOHO2dP279cOo7USj-hotEQSSgaVWtkgde4BepZ3rA5llCmYIKcHAg4dkYfl17E0c3rEcbWV8lJvmf4mIlAz2vJgCvJmGB510_QcpcB8PB22bsq3Yd8nlF2RTqN4rp1b2nslPOlTsXghzNjM9fZi60SGrQQjJrIR-rTJw-RPdyLg9d6tsmBWt3BrcjXo2Ylptc4Tcw6zRXatR4E4Cqiez02BHvEp8GT9EQGowNFc"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
              alt="Map"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-sm font-bold text-white mb-1">Source Map</h3>
              <p className="text-[10px] text-gray-300">Live heatmap <span className="text-primary font-bold">Unavailable</span></p>
            </div>
          </div>

          <Card className="border-white/5 p-6">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Available Composition</h3>
            <div className="bg-surface-dark/50 p-4 rounded-lg text-xs text-gray-500 text-center">
              No active composition data.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  trend,
  trendSub,
  sub,
  trendColor = "text-primary",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendSub?: string;
  sub?: string;
  trendColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:border-primary/20 transition-all h-32 flex flex-col border-white/5 bg-surface-darker/50">
      <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />

      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-white/5 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
            {icon}
          </div>
          {trend && (
            <span className={cn(trendColor, "flex items-center text-[10px] font-bold bg-white/5 px-2 py-1 rounded-full border border-white/5")}>
              {trend.startsWith('+') ? <Icons.TrendingUp size={12} className="mr-1" /> : <Icons.TrendingDown size={12} className="mr-1" />}
              {trend}
            </span>
          )}
        </div>

        <div className="mt-auto space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {(trendSub || sub) && (
            <p className="text-[10px] text-gray-500 font-medium pt-1 border-t border-white/5 mt-2 inline-block">
              {trendSub || sub}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function LotCard({
  id,
  fullId,
  title,
  desc,
  grade,
  value,
  time,
  image,
}: {
  id: string;
  fullId: string;
  title: string;
  desc: string;
  grade: string;
  value: string;
  time: string;
  image: string;
}) {
  return (
    <GlassCard className="p-3 flex gap-4 hover:border-primary/40 transition-all cursor-pointer group border-white/5 bg-surface-darker/50 hover:bg-surface-darker/80 items-stretch">
      <div className="w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900 relative border border-white/5">
        <img src={image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity scale-100 group-hover:scale-105 duration-500" alt="lot" />
        <div className="absolute top-0 right-0 p-1.5">
          <div className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">
            {grade}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
            <span className="font-mono text-[10px] text-gray-500">#{id}</span>
          </div>
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 mt-2">
          <div>
            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Value</p>
            <p className="text-sm font-bold text-white font-mono">{value}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Starts In</p>
            <p className="text-sm font-mono text-warning font-bold">{time}</p>
          </div>
        </div>
        <div className="mt-4">
          <BidButton itemId={fullId} />
        </div>
      </div>
    </GlassCard>
  );
}

type CompItem = { name: string; value: string; percentage: number };

const elementColors: Record<string, string> = {
  Au: 'bg-yellow-400', Gold: 'bg-yellow-400',
  Ag: 'bg-gray-300', Silver: 'bg-gray-300',
  Cu: 'bg-orange-500', Copper: 'bg-orange-500',
  Pd: 'bg-blue-400', Palladium: 'bg-blue-400',
  Al: 'bg-gray-400', Aluminum: 'bg-gray-400',
};

function MarketRow({
  id,
  shortId,
  title,
  loc,
  weight,
  bid,
  time,
  comp,
  icon,
}: {
  id: string;
  shortId: string;
  title: string;
  loc: string;
  weight: string;
  bid: string;
  time: string;
  comp: CompItem[];
  icon: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-primary/5 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            {icon}
          </div>
          <div>
            <p className="font-bold text-white">{shortId} - {title}</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1"><Icons.MapPin size={10} /> {loc}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
          {comp.map((c, i) => (
            <div
              key={i}
              className={elementColors[c.name] || 'bg-gray-600'}
              style={{ width: `${c.percentage}%` }}
            />
          ))}
        </div>
        <div className="text-[10px] text-gray-500 mt-2 flex gap-3 font-bold flex-wrap w-32">
          {comp.slice(0, 3).map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", elementColors[c.name] || 'bg-gray-600')} /> {c.name}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-xs font-bold text-white">{weight}</td>
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-primary font-mono">{bid}</div>
        <div className="text-[10px] text-success flex items-center font-bold">
          <Icons.TrendingUp size={10} className="mr-0.5" /> 2.1%
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-0.5 rounded-md bg-error/10 text-error text-[10px] font-bold border border-error/20">
          {time}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <BidButton itemId={id} />
      </td>
    </tr>
  );
}
