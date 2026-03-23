"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SellIcon } from "@/components/icons";
import { BidderProfileModal } from "@/components/marketplace/BidderProfileModal";
import { BidsListModal } from "./BidsListModal";

interface BidderProfile {
  id: string;
  business_name: string | null;
  first_name: string | null;
  last_name: string | null;
  trust_score: number;
  avatar_url: string | null;
  location: string | null;
  tier: string | null;
  trust_flags: string[] | null;
}

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  users: BidderProfile;
}

interface InventoryItemBidsProps {
  itemId: string;
  bids: Bid[];
  itemTitle?: string;
  onAcceptSuccess?: () => void;
}

export function InventoryItemBids({ itemId, bids, itemTitle = "this item", onAcceptSuccess }: InventoryItemBidsProps) {
  const [isListOpen, setIsListOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Find the highest bid
  const highestBid = bids.length > 0 
    ? bids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current)
    : null;

  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-end">
        <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">No Bids Yet</p>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg opacity-40 cursor-not-allowed">
          <SellIcon size={14} />
        </Button>
      </div>
    );
  }

  const hasMultipleBids = bids.length > 1;

  return (
    <>
      <div className="flex flex-col items-end">
        <p className="text-[8px] text-primary uppercase tracking-widest font-bold mb-1">
          {bids.length} {bids.length === 1 ? 'Bid' : 'Offers'}
        </p>
        <Button 
          variant="primary" 
          size="sm" 
          className="h-8 px-3 rounded-lg flex items-center gap-2 group/btn shadow-glow-primary"
          onClick={() => hasMultipleBids ? setIsListOpen(true) : setIsProfileOpen(true)}
        >
          <span className="text-xs font-bold font-mono">${highestBid?.amount}</span>
          <SellIcon size={14} className="group-hover/btn:scale-110 transition-transform" />
        </Button>
        {hasMultipleBids && (
            <span className="text-[7px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Compare {bids.length} Bids</span>
        )}
      </div>

      {hasMultipleBids ? (
        <BidsListModal
          itemId={itemId}
          itemTitle={itemTitle}
          bids={bids}
          isOpen={isListOpen}
          onClose={() => setIsListOpen(false)}
          onAcceptSuccess={onAcceptSuccess}
        />
      ) : (
        highestBid && (
          <BidderProfileModal
            bid={highestBid}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onAcceptSuccess={onAcceptSuccess}
          />
        )
      )}
    </>
  );
}
