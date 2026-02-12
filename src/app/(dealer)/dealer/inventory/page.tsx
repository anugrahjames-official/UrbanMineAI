import { Button } from "@/components/ui/button";
import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, SlidersHorizontal, ArrowRight } from "lucide-react";
import { getDealerInventory } from "@/app/actions/dealer";
import Link from 'next/link';

interface InventoryItemData {
  id: string;
  title: string;
  weight: string;
  value: string | number;
  grade: string;
  variant: "primary" | "success" | "warning" | "error" | "info";
  image: string;
}

export default async function DealerInventoryPage() {
  const inventory = (await getDealerInventory()) as InventoryItemData[];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-gray-400 mt-1">Manage scanned lots and prepare them for matching and sale.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2 border-white/10">
            <SlidersHorizontal size={16} /> Manage Columns
          </Button>
          <Button className="gap-2 shadow-glow-primary">
            List Selected <ArrowRight size={16} />
          </Button>
        </div>
      </header>

      <Card className="p-0 border-white/5 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-white/5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              className="w-full bg-surface-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600"
              placeholder="Search inventory..."
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-surface-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 focus:ring-1 focus:ring-primary cursor-pointer hover:text-white transition-colors">
              <option>All Grades</option>
              <option>Grade A</option>
              <option>Grade B</option>
              <option>Grade C</option>
            </select>
            <Button variant="secondary" size="icon" className="h-11 w-11 border-white/10">
              <Filter size={18} />
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <InventoryCard
                key={item.id}
                title={item.title}
                weight={item.weight}
                value={item.value.toString()}
                grade={item.grade}
                variant={item.variant}
                image={item.image}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white">No items found</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Start scanning items to populate your inventory.</p>
              <Link href="/dealer/scan">
                <Button>Scan New Item</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function InventoryCard({
  title,
  weight,
  value,
  grade,
  variant,
  image,
}: {
  title: string;
  weight: string;
  value: string;
  grade: string;
  variant: "primary" | "success" | "warning" | "error" | "info";
  image: string;
}) {
  return (
    <GlassCard className="p-0 overflow-hidden group border-white/5 card-hover">
      <div className="relative h-40 bg-surface-darker">
        <img src={image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={title} />
        <div className="absolute top-3 left-3">
          <StatusBadge variant={variant}>{grade}</StatusBadge>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background-dark to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{weight}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Est. Value</p>
            <p className="text-lg font-bold text-primary">{value}</p>
          </div>
          <Button variant="secondary" size="sm" className="h-9 border-white/10">
            Details
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
