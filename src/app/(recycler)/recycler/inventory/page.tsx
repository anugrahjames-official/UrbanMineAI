import { getRecyclerInventory } from "@/app/actions/recycler";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Package, Scale } from "lucide-react";

interface EvaluationData {
  category?: string;
  weight?: string;
  estimatedValue?: string | number;
  grade?: string;
}

export default async function RecyclerInventoryPage() {
  const inventory = await getRecyclerInventory();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Inventory</h1>
        <p className="text-sm text-gray-400">Track lots acquired and currently in processing.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.length > 0 ? (
          inventory.map((item) => {
            const meta = item.metadata as unknown as EvaluationData;
            return (
              <Card key={item.id} className="border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{meta?.category || "Unknown Lot"}</h3>
                      <p className="text-xs text-gray-500">ID: {item.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <StatusBadge variant={item.status === 'processed' ? 'success' : 'primary'}>
                    {item.status || 'In Stock'}
                  </StatusBadge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Weight</p>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                      <Scale size={12} className="text-gray-400" />
                      {meta?.weight || "N/A"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Grade</p>
                    <p className="text-sm font-bold text-white">{meta?.grade || "Ungraded"}</p>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full border-white/5 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Package size={20} className="text-gray-500" />
            </div>
            <p className="text-white font-medium">No inventory yet</p>
            <p className="text-sm text-gray-500">Acquired lots will appear here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

