'use client';

import { MapPin, ShieldCheck, Star, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import BidModal from './BidModal';
import ListingImage from './ListingImage';
import { UserAvatar } from '@/components/ui/UserAvatar';

import RoleRestrictionModal from './RoleRestrictionModal';

interface ListingCardProps {
    item: any; // Type strictly later
    isLoggedIn?: boolean;
    userRole?: string;
}

import AuthModal from '../auth/AuthModal';

export default function ListingCard({ item, isLoggedIn = false, userRole }: ListingCardProps) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const metadata = item.metadata || {};
    // Extract values or defaults
    const estValue = metadata.estimatedValue || 'Negotiable';
    const weight = metadata.weight || item.weight || 'N/A';
    const title = metadata.title || item.title || item.name || 'Untitled Listing';
    const location = metadata.location || item.location || item.users?.location || 'Unknown Location';
    const currentBid = item.current_bid ? `$${item.current_bid}` : estValue;
    const imageUrl = item.image_url || '';
    const description = metadata.description || item.description || '';
    const isEprCredit = metadata.type === 'epr_credit' || 
                       (Array.isArray(metadata.tags) && metadata.tags.includes('EPR Credit')) ||
                       item.category === 'epr_credit';
    const mainImageUrl = isEprCredit ? '' : (item.image_url || metadata.image_url || '');

    // User Details
    const seller = item.users || {};
    const individualName =
        (seller.first_name ? `${seller.first_name} ${seller.last_name || ''}`.trim() : '') ||
        seller.business_name ||
        'Anonymous Seller';

    const businessName = seller.business_name || '';

    // For the avatar alt text and primary display
    const displayName = individualName;

    const sellerRole = seller.role || 'Seller';
    const sellerTrust = seller.trust_score || 0;
    const sellerAvatar = seller.avatar_url;
    const isVerified = Array.isArray(seller.trust_flags) && seller.trust_flags.includes('verified');
    // Removed email dependency as it's restricted

    return (
        <article className="glass-card rounded-[24px] overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-white/10 bg-[#112117]/50 flex flex-col h-full">
            <div className="relative h-48 overflow-hidden shrink-0 bg-[#1a2f23] flex items-center justify-center">
                <ListingImage
                    mainImage={mainImageUrl}
                    additionalImages={metadata.additional_images || []}
                    title={title}
                    isEprCredit={isEprCredit}
                />

                {!isEprCredit && item.status === 'auction' && (
                    <div className="absolute top-3 left-3 bg-[#112117]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#19e66b] animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-wider text-white uppercase">Live Auction</span>
                    </div>
                )}

                <div className="absolute bottom-3 right-3 flex gap-2 flex-wrap justify-end">
                    {metadata.tags && metadata.tags.map((tag: string) => (
                        <span key={tag} className="bg-black/60 backdrop-blur-md text-[#19e66b] text-[10px] font-bold px-2 py-1 rounded-md border border-[#19e66b]/20 shadow-[0_0_10px_rgba(25,230,107,0.2)]">
                            {tag}
                        </span>
                    ))}
                    {isVerified && (
                        <span className="bg-[#19e66b]/20 backdrop-blur-md text-[#19e66b] text-[10px] font-bold px-2 py-1 rounded-md border border-[#19e66b]/20 shadow-[0_0_10px_rgba(25,230,107,0.2)]">
                            Verified
                        </span>
                    )}
                    {!metadata.tags && !isVerified && (
                        <span className="bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                            Standard
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                {isEprCredit && (
                    <div className="flex gap-2 flex-wrap mb-3">
                        {metadata.tags && metadata.tags.map((tag: string) => (
                            <span key={tag} className="bg-[#19e66b]/10 text-[#19e66b] text-[10px] font-bold px-2 py-1 rounded-md border border-[#19e66b]/20">
                                {tag}
                            </span>
                        ))}
                        {isVerified && (
                            <span className="bg-[#19e66b]/20 text-[#19e66b] text-[10px] font-bold px-2 py-1 rounded-md border border-[#19e66b]/20">
                                Verified
                            </span>
                        )}
                    </div>
                )}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-2">{title}</h3>
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

                {/* Seller Info */}
                <div className="flex items-center gap-3 my-3 p-2 rounded-xl bg-white/5 border border-white/5">
                    <UserAvatar
                        user={{
                            name: displayName,
                            avatar_url: sellerAvatar,
                            email: '' // Fallback not using email anymore
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
                                {sellerRole}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            {businessName && (
                                <span className="text-[#19e66b] font-medium truncate max-w-[100px]">{businessName}</span>
                            )}
                            <div className="flex items-center gap-1 text-white/50">
                                <ShieldCheck size={12} className="text-[#19e66b]" />
                                <span>Trust: {sellerTrust}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4">
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                        <span className="block text-[10px] text-white/40 uppercase">Est. Value / kg</span>
                        <span className="block text-sm font-bold text-white">{estValue}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                        <span className="block text-[10px] text-white/40 uppercase">Weight</span>
                        <span className="block text-sm font-bold text-white">{weight}</span>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-white/10 mt-auto">

                    {isLoggedIn ? (
                        (userRole === 'recycler' && sellerRole !== 'recycler') || (userRole === 'oem' && sellerRole === 'recycler') ? (
                            <BidModal item={item}>
                                <button className="bg-white hover:bg-gray-100 text-[#112117] font-bold py-2 px-6 rounded-xl text-sm transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                    {userRole === 'oem' ? 'Buy Now' : 'Bid Now'}
                                </button>
                            </BidModal>
                        ) : (
                            <button
                                onClick={() => setShowRoleModal(true)}
                                className="bg-white/10 hover:bg-white/20 text-white/40 font-bold py-2 px-6 rounded-xl text-sm transition-all border border-white/10"
                            >
                                {userRole === 'oem' ? 'Buy Now' : 'Bid Now'}
                            </button>
                        )
                    ) : (
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="bg-white hover:bg-gray-100 text-[#112117] font-bold py-2 px-6 rounded-xl text-sm transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        >
                            Bid Now
                        </button>
                    )}
                </div>
            </div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <RoleRestrictionModal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                requiredRole="recycler"
                action="bid on listings"
            />
        </article>
    );
}
