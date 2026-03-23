"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { X, User, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BidderProfileModal } from "@/components/marketplace/BidderProfileModal";

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

interface BidsListModalProps {
  itemId: string;
  itemTitle: string;
  bids: Bid[];
  isOpen: boolean;
  onClose: () => void;
  onAcceptSuccess?: () => void;
}

export function BidsListModal({ itemId, itemTitle, bids, isOpen, onClose, onAcceptSuccess }: BidsListModalProps) {
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  if (!isOpen) return null;

  // Sort bids by amount descending
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl bg-surface-darker border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
            <div>
              <h2 className="text-xl font-bold text-white">Compare Bids</h2>
              <p className="text-xs text-gray-400 mt-1">Reviewing {bids.length} offers for {itemTitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Bids List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {sortedBids.map((bid, index) => {
              const bidder = bid.users;
              const name = bidder.business_name || `${bidder.first_name} ${bidder.last_name}`.trim() || "Anonymous";
              const isHighest = index === 0;

              return (
                <GlassCard 
                  key={bid.id} 
                  className={`p-4 border-white/5 group hover:border-primary/30 transition-all cursor-pointer ${isHighest ? 'bg-primary/5 border-primary/20' : ''}`}
                  onClick={() => setSelectedBid(bid)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                        {bidder.avatar_url ? (
                          <img src={bidder.avatar_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white group-hover:text-primary transition-colors">{name}</h4>
                          {isHighest && (
                            <span className="text-[8px] bg-primary text-background-dark font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              Highest
                            </span>
                          )}
                          {bidder.trust_flags?.includes('verified') && (
                            <ShieldCheck size={14} className="text-primary" fill="currentColor" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Star size={10} className="text-warning fill-warning" /> {bidder.trust_score} Trust
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Offer</p>
                        <p className={`text-xl font-bold font-mono ${isHighest ? 'text-primary' : 'text-white'}`}>
                          ${bid.amount}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20 text-center">
            <p className="text-[10px] text-gray-500 italic">
              Click on an offer to view the bidder's full profile and finalize the sale.
            </p>
          </div>
        </div>
      </div>

      {selectedBid && (
        <BidderProfileModal
          bid={selectedBid}
          isOpen={!!selectedBid}
          onClose={() => setSelectedBid(null)}
          onAcceptSuccess={() => {
            onAcceptSuccess?.();
            onClose();
          }}
        />
      )}
    </>
  );
}
