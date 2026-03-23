'use client';

import { MapPin, Target, Weight, ShieldCheck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import BidModal from './BidModal'; // Re-use modal for now, or create FulfillModal

import RoleRestrictionModal from './RoleRestrictionModal';

interface BountyCardProps {
    bounty: any; // Type strictly later
    isLoggedIn?: boolean;
    userRole?: string;
}

import { useState } from 'react';
import AuthModal from '../auth/AuthModal';
import FulfillBountyModal from './FulfillBountyModal';

export default function BountyCard({ bounty, isLoggedIn = false, userRole }: BountyCardProps) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showFulfillModal, setShowFulfillModal] = useState(false);

    const material = bounty.material || 'Unknown Material';
    const quantity = bounty.quantity || 0;
    const unit = bounty.unit || 'kg';
    const targetPrice = bounty.target_price ? `$${bounty.target_price}` : 'Market Rate';
    const recyclerName = bounty.users?.business_name || 'Anonymous Recycler';
    const metadata = bounty.metadata || {};
    const location = metadata.location || bounty.location || bounty.users?.location || 'Unknown Location';
    const description = metadata.description || bounty.description || '';

    // User Details
    const poster = bounty.users || {};
    const individualName =
        (poster.first_name ? `${poster.first_name} ${poster.last_name || ''}`.trim() : '') ||
        poster.business_name ||
        'Anonymous Recycler';

    const businessName = poster.business_name || '';
    const displayName = individualName;

    const posterRole = poster.role || 'Recycler';
    const posterTrust = poster.trust_score || 0;
    const posterAvatar = poster.avatar_url;
    const isVerified = Array.isArray(poster.trust_flags) && poster.trust_flags.includes('verified');
    // Removed email dependency

    const hasMedia =
        Boolean(bounty.image_url) ||
        (Array.isArray(bounty.images) && bounty.images.length > 0) ||
        (Array.isArray(metadata.images) && metadata.images.length > 0) ||
        (Array.isArray(metadata.videos) && metadata.videos.length > 0);

    return (
        <article className="glass-card rounded-[24px] overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-white/10 bg-[#112117]/50 flex flex-col h-full relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#19e66b]"></div>

            {hasMedia && (
                <div className="relative h-32 overflow-hidden shrink-0 bg-gradient-to-br from-[#1a2f23] to-[#112117] flex items-center justify-center border-b border-white/5">
                    {/* Placeholder for now if media exists but we don't have an image component ready, 
                        or we can implement ListingImage if valuable. For now, showing placeholder as requested 
                        (implied: don't show empty space if NO media). */}
                    <div className="flex flex-col items-center justify-center text-white/20 group-hover:text-white/30 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-[#19e66b]/10 border border-[#19e66b]/20 flex items-center justify-center mb-2">
                            <Target size={20} className="text-[#19e66b]/60" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-medium">Material Bounty</span>
                    </div>
                </div>
            )}

            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="inline-block py-1 px-2 rounded-md bg-[#19e66b]/10 text-[#19e66b] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#19e66b]/20">
                            Wanted
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight mb-1">{material}</h3>
                        <p className="text-xs text-white/50 flex items-center gap-1">
                            <MapPin size={14} /> {location}
                        </p>
                        {description && (
                            <p className="text-xs text-white/70 mt-2 line-clamp-3 font-light">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 my-3 p-2 rounded-xl bg-white/5 border border-white/5">
                    <UserAvatar
                        user={{
                            name: displayName,
                            avatar_url: posterAvatar,
                            email: '' // Fallback not using email
                        }}
                        className="w-8 h-8"
                    />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm font-bold text-white truncate">{displayName}</span>
                            {isVerified && (
                                <CheckCircle size={14} className="text-[#19e66b] shrink-0" fill="currentColor" />
                            )}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#19e66b]/20 text-[#19e66b] border border-[#19e66b]/20 shrink-0">
                                {posterRole}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            {businessName && (
                                <span className="text-[#19e66b] font-medium truncate max-w-[100px]">{businessName}</span>
                            )}
                            <div className="flex items-center gap-1 text-white/50">
                                <ShieldCheck size={12} className="text-[#19e66b]" />
                                <span>Trust: {posterTrust}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg text-white/70">
                            <Weight size={16} />
                        </div>
                        <div>
                            <span className="block text-[10px] text-white/40 uppercase font-medium">Quantity</span>
                            <span className="block text-sm font-bold text-white">{quantity} {unit}</span>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg text-white/70">
                            <Target size={16} />
                        </div>
                        <div>
                            <span className="block text-[10px] text-white/40 uppercase font-medium">Target Price</span>
                            <span className="block text-sm font-bold text-white">{targetPrice}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/40">
                        {/* Expiry or posted date could go here */}
                        Posted recently
                    </span>
                    <button
                        onClick={() => {
                            if (!isLoggedIn) {
                                setShowAuthModal(true);
                            } else if (userRole !== 'dealer') {
                                setShowRoleModal(true);
                            } else {
                                setShowFulfillModal(true);
                            }
                        }}
                        className={cn(
                            "font-bold py-2 px-6 rounded-xl text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md",
                            (isLoggedIn && userRole !== 'dealer')
                                ? "bg-white/10 text-white/40 border border-white/10"
                                : "bg-[#19e66b] hover:bg-[#16cc5f] text-[#112117] shadow-[0_0_15px_rgba(25,230,107,0.2)]"
                        )}
                    >
                        Fulfill
                    </button>
                </div>
            </div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <FulfillBountyModal 
                isOpen={showFulfillModal} 
                onClose={() => setShowFulfillModal(false)} 
                bounty={bounty} 
            />
            <RoleRestrictionModal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                requiredRole="dealer"
                action="fulfill bounties"
            />
        </article>
    );
}
