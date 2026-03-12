'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, ArrowRight, Check, Trash2 } from "lucide-react";
import Link from 'next/link';
import { publishItems, unpublishItems, deleteInventoryItem } from "@/app/actions/dealer";
import { toast } from "sonner";
import EditItemDialog from "./EditItemDialog";

interface InventoryItemData {
    id: string;
    title: string;
    weight: string;
    value: string | number;
    grade: string;
    variant: "primary" | "success" | "warning" | "error" | "info";
    image: string;
    status?: string; // Add status to track listed vs pending
    description?: string;
}

export default function InventoryManager({ inventory }: { inventory: InventoryItemData[] }) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItemData | null>(null);

    const handleDelete = async (itemId: string) => {
        try {
            await deleteInventoryItem(itemId);
            toast.success("Item deleted successfully");
        } catch (error) {
            console.error("Failed to delete item", error);
            toast.error("Failed to delete item");
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePublish = async () => {
        if (selectedItems.length === 0) return;

        setIsPublishing(true);
        try {
            await publishItems(selectedItems);
            setSelectedItems([]);
            toast.success(`Successfully listed ${selectedItems.length} items`);
        } catch (error) {
            console.error("Failed to publish", error);
            toast.error("Failed to list items");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        if (selectedItems.length === 0) return;

        setIsPublishing(true);
        try {
            await unpublishItems(selectedItems);
            setSelectedItems([]);
            toast.success(`Successfully unlisted ${selectedItems.length} items`);
        } catch (error) {
            console.error("Failed to unpublish", error);
            toast.error("Failed to unlist items");
        } finally {
            setIsPublishing(false);
        }
    };

    const allSelectedAreListed = selectedItems.length > 0 && selectedItems.every(id => {
        const item = inventory.find(i => i.id === id);
        return item?.status === 'listed';
    });

    const someSelectedAreListed = selectedItems.length > 0 && selectedItems.some(id => {
        const item = inventory.find(i => i.id === id);
        return item?.status === 'listed';
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Inventory</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage scanned lots and prepare them for matching and sale.</p>
                </div>
                <div className="flex gap-3">

                    <Button
                        className={`gap-2 ${someSelectedAreListed ? 'shadow-glow-warning bg-warning hover:bg-warning/90 text-black' : 'shadow-glow-primary'}`}
                        onClick={someSelectedAreListed ? handleUnpublish : handlePublish}
                        disabled={selectedItems.length === 0 || isPublishing}
                    >
                        {isPublishing ? (someSelectedAreListed ? 'Unlisting...' : 'Listing...') :
                            someSelectedAreListed ? `Unlist Selected (${selectedItems.length})` : `List Selected (${selectedItems.length})`}
                        <ArrowRight size={16} />
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
                                item={item}
                                isSelected={selectedItems.includes(item.id)}
                                onToggle={() => toggleSelection(item.id)}
                                onEdit={() => setEditingItem(item)}
                                onDelete={() => handleDelete(item.id)}
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

            {editingItem && (
                <EditItemDialog
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                />
            )}
        </div>
    );
}

function InventoryCard({
    item,
    isSelected,
    onToggle,
    onEdit,
    onDelete
}: {
    item: InventoryItemData;
    isSelected: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDeleting) {
            onDelete();
        } else {
            setIsDeleting(true);
            setTimeout(() => setIsDeleting(false), 3000); // Reset after 3 seconds if not confirmed
        }
    };

    return (
        <div className={`relative group transition-all duration-200 ${isSelected ? 'ring-2 ring-primary rounded-xl scale-[1.02]' : ''}`}>

            {/* Selection Checkbox Overlay */}
            <div
                className="absolute top-3 right-3 z-20 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
            >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'bg-black/40 border-white/30 hover:border-white'}`}>
                    {isSelected && <Check size={14} className="text-black font-bold" />}
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden group border-white/5 bg-surface-darker hover:bg-surface-dark transition-colors h-full flex flex-col">
                <div className="relative h-40 bg-surface-darker">
                    <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.title} />
                    <div className="absolute top-3 left-3">
                        <StatusBadge variant={item.variant}>{item.grade}</StatusBadge>
                    </div>
                    {item.status === 'listed' && (
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-success border border-success/20">
                            LISTED
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background-dark to-transparent" />
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 min-h-[2.5em]">{item.description || 'No description available'}</p>
                        <p className="text-sm text-gray-500 mt-2 font-medium">{item.weight}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Est. Value / kg</p>
                            <p className="text-lg font-bold text-primary">{typeof item.value === 'number' ? `$${item.value}` : item.value}</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 border-white/10 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className={`h-9 ml-2 transition-all ${isDeleting ? 'w-24 bg-red-600 hover:bg-red-700 text-white border-red-600' : 'w-9 px-0 bg-transparent border-red-500/30 hover:bg-red-500/10 text-red-500 hover:text-red-400'}`}
                            onClick={handleDeleteClick}
                        >
                            {isDeleting ? "Confirm" : <Trash2 size={14} />}
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
