import { getDealerInventory } from "@/app/actions/dealer";
import InventoryManager from "@/components/dealer/InventoryManager";

interface InventoryItemData {
  id: string;
  title: string;
  weight: string;
  value: string | number;
  grade: string;
  variant: "primary" | "success" | "warning" | "error" | "info";
  image: string;
  status?: string;
  description?: string;
}

export default async function DealerInventoryPage() {
  const inventory = (await getDealerInventory()) as InventoryItemData[];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <InventoryManager inventory={inventory} />
    </div>
  );
}
