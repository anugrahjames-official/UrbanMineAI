"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Icons, Check, X, Loader2, User, CheckCircle, MapPin, Star, Mail } from "@/components/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { acceptBid } from "@/app/actions/marketplace";
import { toast } from "sonner";

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

interface BidderProfileModalProps {
  bid: Bid;
  isOpen: boolean;
  onClose: () => void;
  onAcceptSuccess?: () => void;
}

export function BidderProfileModal({ bid, isOpen, onClose, onAcceptSuccess }: BidderProfileModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  if (!isOpen) return null;

  const bidder = bid.users;
  const name = bidder.business_name || `${bidder.first_name} ${bidder.last_name}`.trim() || "Anonymous";

  const handleAcceptBid = async () => {
    try {
      setIsAccepting(true);
      const result = await acceptBid(bid.id);
      if (result.success) {
        toast.success("Bid Accepted!", {
          description: `You have successfully sold this item to ${name} for $${bid.amount}.`,
        });
        onAcceptSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to accept bid.",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMailBidder = () => {
    window.location.href = `mailto:?subject=Regarding your bid on UrbanMineAI&body=Hi ${name}, I am interested in your bid of $${bid.amount}...`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface-darker border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute -bottom-10 left-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-surface-dark border-4 border-surface-darker overflow-hidden">
                {bidder.avatar_url ? (
                  <img src={bidder.avatar_url} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg border-2 border-surface-darker flex items-center justify-center">
                <CheckCircle size={12} className="text-background-dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-8 pb-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">{name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={14} /> {bidder.location || "Location not disclosed"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Bid Amount</p>
              <p className="text-3xl font-bold text-primary font-mono">${bid.amount}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4 border-white/5 flex flex-col items-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Trust Score</p>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="text-warning fill-warning" size={20} />
                {bidder.trust_score}
              </div>
            </GlassCard>
            <GlassCard className="p-4 border-white/5 flex flex-col items-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Member Tier</p>
              <StatusBadge variant="primary" className="px-3 py-1 text-[10px]">
                {bidder.tier || "Standard"}
              </StatusBadge>
            </GlassCard>
          </div>

          {bidder.trust_flags && bidder.trust_flags.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Verifications</p>
              <div className="flex flex-wrap gap-2">
                {bidder.trust_flags.map((flag, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400 font-medium">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
            <Button 
              variant="secondary" 
              className="h-12 font-bold gap-2 bg-white/5 border-white/10 hover:bg-white/10"
              onClick={handleMailBidder}
            >
              <Mail size={18} /> Contact Bidder
            </Button>
            <Button 
              className="h-12 font-bold gap-2 shadow-glow-primary"
              onClick={handleAcceptBid}
              disabled={isAccepting}
            >
              {isAccepting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Sell to Bidder
            </Button>
          </div>
          
          <p className="text-center text-[10px] text-gray-500 italic">
            * Accepting a bid will mark the item as sold and finalize the transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
