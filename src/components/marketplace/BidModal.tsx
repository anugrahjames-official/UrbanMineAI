'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Weight, Award, Eye, Timer as TimerIcon, Gavel, Bot, X, FlaskConical, BarChart3, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import YieldAnalysis from './YieldAnalysis';
import ListingImage from './ListingImage';
import { placeBid, incrementViewCount } from '@/app/actions/marketplace';
import { toast } from 'sonner';

interface BidModalProps {
    children: React.ReactNode;
    item: any;
}

export default function BidModal({ children, item }: BidModalProps) {
    const metadata = item.metadata || {};
    const currentPrice = item.current_bid || item.price || 0;

    const [open, setOpen] = useState(false);
    // Initialize with 0 or calculate only if needed. Better to set in effect when opening.
    const [bidAmount, setBidAmount] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const wasOpen = useRef(false);

    const title = metadata.title || item.title || item.name || 'Untitled Lot';
    const category = metadata.category || item.category || 'E-Waste';
    const location = metadata.location || item.location || 'Unknown';
    const weight = metadata.weight || item.weight || 'N/A';
    const lotNumber = metadata.lot_number || '#4928';
    const grade = metadata.grade || item.grade || 'A+';
    const views = (metadata.views || 0);

    // Sync with newest data if it arrives/changes
    useEffect(() => {
        if (open && !wasOpen.current) {
            // Modal just opened
            incrementViewCount(item.id);
            const startPrice = currentPrice > 0 ? Math.floor(currentPrice * 1.05) : 10;
            setBidAmount(startPrice.toString());
        }
        wasOpen.current = open;
    }, [open, currentPrice, item.id]);

    // Yield Analysis Mapping
    const getSymbol = (name: string) => {
        const map: { [key: string]: string } = { 'Gold': 'Au', 'Palladium': 'Pd', 'Silver': 'Ag', 'Copper': 'Cu', 'Platinum': 'Pt', 'Aluminum': 'Al' };
        return map[name] || name.substring(0, 2);
    };

    const getColor = (name: string) => {
        const map: { [key: string]: string } = {
            'Gold': 'text-[#FFD700] bg-[#FFD700]',
            'Palladium': 'text-[#CED0CE] bg-[#CED0CE]',
            'Silver': 'text-[#C0C0C0] bg-[#C0C0C0]',
            'Copper': 'text-[#B87333] bg-[#B87333]'
        };
        return map[name] || 'text-[#19e66b] bg-[#19e66b]';
    };

    // Parse bids with bidder info
    const parseBids = (bids: any[]) => (bids || []).map((bid: any) => ({
        id: bid.id,
        user: bid.users?.business_name || bid.bidder_alias || 'Anonymous',
        amount: bid.amount,
        time: new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        trustScore: bid.users?.trust_score || 0, // Use actual score
        timestamp: new Date(bid.created_at).getTime()
    })).sort((a: any, b: any) => b.amount - a.amount);

    const [localBids, setLocalBids] = useState(parseBids(item.bids));

    useEffect(() => {
        setLocalBids(parseBids(item.bids));
    }, [item.bids]);

    const reeYields = metadata.reeContent?.map((item: any) => ({
        element: item.name,
        symbol: getSymbol(item.name),
        estimate: item.value,
        unit: '',
        percentage: item.percentage,
        value: item.estimatedValue || 'Est.',
        color: getColor(item.name),
        status: 'Detected'
    }));

    const finalYields = reeYields || metadata.yields;

    // Use totalValue from metadata if available, otherwise calculate
    const totalEstimatedValue = metadata.totalValue
        ? parseFloat(metadata.totalValue.toString().replace(/[^0-9.]/g, ''))
        : (finalYields?.reduce((acc: number, item: any) => {
            const valString = item.estimatedValue?.toString() || item.value?.toString() || '0';
            // Try to parse estimatedValue ($0.30) first, then value if it's just a number?
            // the 'value' field in reeContent was 'Yield (e.g. 0.005g)', not price.
            // So we should strictly look for 'estimatedValue' for price sum.
            const priceString = item.estimatedValue?.toString() || '0';
            const val = parseFloat(priceString.replace(/[^0-9.]/g, ''));
            return acc + (isNaN(val) ? 0 : val);
        }, 0) || 0);

    // Format for display
    const formattedTotalValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(totalEstimatedValue);


    // Timer logic
    const calculateTimeLeft = () => {
        const createdAt = new Date(item.created_at || Date.now());
        const durationStr = metadata.duration || '24h';
        let durationHours = 24;

        if (durationStr.endsWith('h')) {
            durationHours = parseInt(durationStr.replace('h', '')) || 24;
        } else if (durationStr.endsWith('d')) {
            durationHours = (parseInt(durationStr.replace('d', '')) || 1) * 24;
        }

        const endTime = new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000);
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();

        if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!open) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [open]);

    const formatTime = (time: { hours: number, minutes: number, seconds: number }) => {
        const { hours, minutes, seconds } = time;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlaceBid = async () => {
        const amount = parseInt(bidAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid bid amount.');
            return;
        }

        // Check if bid is higher than current highest bid
        const highestBid = localBids.length > 0 ? Math.max(...localBids.map((b: any) => b.amount)) : currentPrice;
        if (amount <= highestBid) {
            toast.error(`Your bid must be higher than the current highest bid of $${highestBid.toLocaleString()}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await placeBid(item.id, amount);
            if (result.success) {
                toast.success('Bid placed successfully!');
                const newBid = {
                    id: Date.now().toString(),
                    user: 'You',
                    amount: amount,
                    time: 'Just now',
                    isMe: true
                };
                // Mark previous leading as false and add new bid
                const updatedHistory = localBids.map((b: any) => ({ ...b, isLeading: false }));
                setLocalBids([newBid, ...updatedHistory]);

                // Auto-scroll to bottom of feed
                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }, 100);
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const highestBidAmount = localBids.length > 0 ? Math.max(...localBids.map((b: any) => b.amount)) : 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[1200px] w-[95vw] h-auto max-h-[85vh] md:max-h-[90vh] md:h-[90vh] p-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-[#050a07] border-white/10 rounded-[24px] shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Place a bid on {title}. Current highest bid is ${highestBidAmount.toLocaleString()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col md:flex-row w-full h-full md:overflow-hidden">
                    {/* LEFT PANEL: Product Details */}
                    <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col border-b md:border-b-0 md:border-r border-[#19e66b]/10 bg-black/20 h-auto md:h-full overflow-visible md:overflow-y-auto custom-scrollbar">
                        {/* Hero Image Area */}
                        <div className="relative w-full aspect-video md:aspect-[21/9] group overflow-hidden shrink-0">
                            <div className="absolute inset-0">
                                <ListingImage
                                    title={title}
                                    mainImage={item.image_url || 'https://lh3.googleusercontent.com/placeholder'}
                                    additionalImages={metadata.additional_images}
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050a07]/90 via-transparent to-transparent pointer-events-none"></div>

                            {/* Overlay Badges */}
                            <div className="absolute top-6 left-6 flex gap-3 z-20">
                                <span className="bg-[#19e66b]/90 text-[#050a07] text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(25,230,107,0.4)] tracking-wider">
                                    LIVE AUCTION
                                </span>
                                <span className="bg-black/60 text-white text-[10px] font-medium px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                    <Eye size={14} /> {views} Watching
                                </span>
                            </div>

                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 pointer-events-none">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[#19e66b] text-xs font-mono uppercase tracking-widest">{lotNumber}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                                    <span className="text-white/70 text-xs">E-Waste Category: {category}</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-none mb-4">{title}</h1>
                                <div className="flex flex-wrap gap-4 text-xs text-white/80 items-center">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                                        <Award size={16} className="text-[#19e66b]" />
                                        Grade: <span className="text-white font-bold">{grade}</span>
                                    </span>
                                    {totalEstimatedValue > 0 && (
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                                            <DollarSign size={16} className="text-[#19e66b]" />
                                            Est. Value: <span className="text-white font-bold">${totalEstimatedValue.toLocaleString()}</span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-white/40" />
                                        {location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Weight size={16} className="text-white/40" />
                                        {weight}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Product Intelligence / Details */}
                        <div className="p-6 md:p-8 space-y-8">
                            <YieldAnalysis yields={finalYields} confidence={metadata.ai_confidence || item.confidence} />

                            {/* Additional Metadata Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Condition</p>
                                    <p className="text-sm font-semibold text-white">{metadata.condition || 'Unsorted / Raw'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Packaging</p>
                                    <p className="text-sm font-semibold text-white">{metadata.packaging || 'Gaylord Box'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Logistics</p>
                                    <p className="text-sm font-semibold text-white">{metadata.logistics || 'FOB Destination'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Inspection</p>
                                    <p className="text-sm font-semibold text-white">{metadata.inspection || 'AI Verified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Bidding Console */}
                    <div className="w-full md:w-5/12 lg:w-1/3 flex flex-col bg-[#102218]/40 backdrop-blur-xl relative h-auto md:h-full">
                        {/* Close Button handled by Dialog component */}

                        {/* Timer Header */}
                        <div className="p-6 border-b border-white/5 flex flex-col items-center justify-center bg-black/20 shrink-0">
                            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2 font-semibold">Time Remaining</span>
                            <div className="flex items-center gap-3 text-2xl font-mono text-white font-bold">
                                <TimerIcon size={24} className="text-red-500 animate-pulse" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Bidding Feed Area */}
                        <div className="flex-1 p-6 relative flex flex-col overflow-hidden min-h-[300px] md:min-h-0">
                            {/* Fading overlay for scroll */}
                            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#102218] via-[#102218]/50 to-transparent z-10 pointer-events-none"></div>

                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto space-y-4 pt-8 custom-scrollbar scroll-smooth h-[300px] md:h-full md:min-h-0"
                            >
                                {localBids.map((bid: any, i: number) => (
                                    <div
                                        key={bid.id}
                                        className={cn(
                                            "flex items-center gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2",
                                            bid.amount === highestBidAmount ? "py-2.5 px-3 bg-white/5 rounded-xl border border-white/10" : "opacity-60",
                                            bid.amount === highestBidAmount && "border-l-2 border-l-[#19e66b]"
                                        )}
                                    >
                                        <span className="text-white/40 font-mono w-14 shrink-0">{bid.time}</span>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0",
                                            bid.isMe ? "bg-[#19e66b]/20 text-[#19e66b] border-[#19e66b]/30" : "bg-white/5 text-white/60 border-white/10"
                                        )}>
                                            {bid.user === 'You' ? 'YO' : bid.user.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white/90">
                                                {bid.user === 'You' ? 'You' : bid.user} <span className="text-white/40">placed</span>
                                            </span>
                                            <span className={cn("font-bold text-sm", bid.amount === highestBidAmount ? "text-[#19e66b]" : "text-white")}>
                                                ${bid.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#102218] to-transparent z-10 pointer-events-none"></div>
                        </div>

                        {/* Current Price & Input Area */}
                        <div className="p-6 bg-black/40 border-t border-[#19e66b]/20 relative shrink-0">
                            {/* AI Insight Bubble */}


                            {/* Current Highest Bid */}
                            <div className="mb-8 text-center pt-4">
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2 font-bold">Current Highest Bid</p>
                                <h2 className="text-4xl md:text-5xl font-black text-[#19e66b] tracking-tighter drop-shadow-[0_0_15px_rgba(25,230,107,0.3)]">
                                    ${highestBidAmount.toLocaleString()}<span className="text-2xl text-[#19e66b]/40">.00</span>
                                </h2>
                            </div>

                            {/* Input Controls */}
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-white/40 font-bold">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        className="block w-full pl-8 pr-32 py-4 bg-[#102218] border-2 border-white/5 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#19e66b] focus:ring-1 focus:ring-[#19e66b] transition-all text-lg font-mono font-bold"
                                        placeholder="Enter amount..."
                                    />
                                    <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                                        <button
                                            onClick={() => setBidAmount(prev => (parseInt(prev || '0') + 50).toString())}
                                            className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                            +$50
                                        </button>
                                        <button
                                            onClick={() => setBidAmount(prev => (parseInt(prev || '0') + 100).toString())}
                                            className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                            +$100
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handlePlaceBid}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "w-full bg-[#19e66b] hover:bg-[#15c25a] text-[#112117] font-black h-12 rounded-xl transition-all transform active:scale-95 shadow-[0_0_20px_rgba(25,230,107,0.3)] uppercase tracking-wider flex items-center justify-center gap-2",
                                        isSubmitting && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-[#112117]/30 border-t-[#112117] rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Gavel size={18} />
                                            Confirm Bid
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-white/30 font-medium tracking-tight">
                                    By placing a bid, you agree to the <a href="#" className="text-white/60 underline decoration-white/20 hover:text-[#19e66b]">UrbanMineAI T&Cs</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
