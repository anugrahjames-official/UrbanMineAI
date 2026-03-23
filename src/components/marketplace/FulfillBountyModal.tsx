'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from 'react';
import { Target, Weight, DollarSign, Send, ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fulfillBounty } from '@/app/actions/bounty';
import { toast } from 'sonner';

interface FulfillBountyModalProps {
    isOpen: boolean;
    onClose: () => void;
    bounty: any;
}

export default function FulfillBountyModal({ isOpen, onClose, bounty }: FulfillBountyModalProps) {
    const [amount, setAmount] = useState<string>(bounty.target_price?.toString() || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const material = bounty.material || 'Material';
    const quantity = bounty.quantity || 0;
    const unit = bounty.unit || 'kg';
    const targetPrice = bounty.target_price || 0;
    const location = bounty.metadata?.location || bounty.location || 'Remote';

    const handleFulfill = async () => {
        const offerAmount = parseFloat(amount);
        if (isNaN(offerAmount) || offerAmount <= 0) {
            toast.error('Please enter a valid offer amount.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await fulfillBounty(bounty.id, offerAmount);
            if (result.success) {
                toast.success('Fulfillment offer submitted successfully!');
                onClose();
            } else {
                toast.error(result.error || 'Failed to submit offer');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] bg-[#050a07] border-white/10 rounded-[24px] shadow-2xl p-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#19e66b]"></div>
                
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="text-[#19e66b]" size={24} />
                        Fulfill Bounty
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                        Submit your offer to fulfill this recycling request.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Material</span>
                            <span className="text-sm font-bold text-white">{material}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Requirement</span>
                            <span className="text-sm font-bold text-white">{quantity} {unit}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Location</span>
                            <span className="text-sm font-bold text-white flex items-center gap-1">
                                <MapPin size={12} className="text-[#19e66b]" />
                                {location}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[#19e66b]">
                            <span className="text-xs uppercase tracking-wider font-bold">Target Price</span>
                            <span className="text-lg font-black">${targetPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Your Offer Price ($)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <DollarSign size={18} className="text-[#19e66b]" />
                                </div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#19e66b] transition-all text-xl font-mono font-bold"
                                    placeholder="Enter amount..."
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-[#19e66b]/5 rounded-xl border border-[#19e66b]/10">
                            <ShieldCheck className="text-[#19e66b] shrink-0 mt-0.5" size={16} />
                            <p className="text-[10px] text-white/60 leading-relaxed">
                                Your offer will be visible to the recycler. If accepted, you will be notified to proceed with the logistics and payment.
                            </p>
                        </div>

                        <button
                            onClick={handleFulfill}
                            disabled={isSubmitting}
                            className={cn(
                                "w-full bg-[#19e66b] hover:bg-[#15c25a] text-[#112117] font-black h-14 rounded-2xl transition-all transform active:scale-95 shadow-[0_0_20px_rgba(25,230,107,0.3)] uppercase tracking-wider flex items-center justify-center gap-2 mt-4",
                                isSubmitting && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-[#112117]/30 border-t-[#112117] rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Offer
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-black/40 text-center">
                    <p className="text-[10px] text-white/30">
                        Offers are binding under UrbanMineAI Marketplace Terms.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
