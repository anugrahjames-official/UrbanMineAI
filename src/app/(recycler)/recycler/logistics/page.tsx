import { getRecyclerLogistics } from "@/app/actions/recycler";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function RecyclerLogisticsPage() {
  const deliveries = await getRecyclerLogistics();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Logistics</h1>
        <p className="text-sm text-gray-400">Inbound pickups and delivery tracking.</p>
      </header>

      <div className="space-y-4">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <Card key={delivery.id} className="border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Incoming from {(delivery.supplier as any)?.name || 'Supplier'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(delivery.supplier as any)?.location || 'Unknown Location'} • {formatDistanceToNow(new Date(delivery.created_at))} ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-16 md:pl-0">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Est. Value</p>
                  <p className="font-bold text-white">${Number(delivery.price_total).toLocaleString()}</p>
                </div>
                <StatusBadge variant="warning">Pending</StatusBadge>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-white/5 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Truck size={20} className="text-gray-500" />
            </div>
            <p className="text-white font-medium">No active deliveries</p>
            <p className="text-sm text-gray-500">Paid transactions pending delivery will appear here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

