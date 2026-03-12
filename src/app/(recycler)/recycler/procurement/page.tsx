import { getRecyclerProcurement } from "@/app/actions/recycler";
import { getUserProfile } from "@/app/actions/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { BountyModal } from "@/components/recycler/create-bounty-modal";
import { BountyActions } from "@/components/recycler/bounty-actions";

interface Bounty {
  id: string;
  title: string | null;
  description: string | null;
  budget_range: string | null;
  status: string;
}

export default async function RecyclerProcurementPage() {
  const bountiesPromise = getRecyclerProcurement();
  const userProfilePromise = getUserProfile();
  const [bounties, userProfile] = await Promise.all([bountiesPromise, userProfilePromise]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Procurement</h1>
          <p className="text-sm text-gray-400 mt-1">Manage buy orders and open bounties.</p>
        </div>
        <BountyModal defaultLocation={userProfile.location || undefined} />
      </header>

      <Card className="p-0 border-white/5 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-white/5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              className="w-full bg-surface-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600"
              placeholder="Search bounties..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" className="h-11 w-11 border-white/10">
              <Filter size={18} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {bounties.length > 0 ? (
            <div className="space-y-4">
              {bounties.map((bounty: any) => (
                <div key={bounty.id} className="p-4 border border-white/5 rounded-lg bg-surface-dark flex justify-between items-center group hover:border-white/10 transition-colors">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {bounty.title || bounty.material || "Untitled Bounty"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {bounty.material} • {bounty.quantity} {bounty.unit || 'kg'} • {bounty.min_grade || "Any Grade"}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {bounty.price_floor ? `$${bounty.price_floor}/${bounty.unit || 'kg'}` : "Negotiable"}
                      </p>
                      <span className="text-xs uppercase tracking-widest text-gray-500">{bounty.status}</span>
                    </div>
                    <BountyActions bounty={bounty} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white">No active bounties</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Create a bounty to find specific materials.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
