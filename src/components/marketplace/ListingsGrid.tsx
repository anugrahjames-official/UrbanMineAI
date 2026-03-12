'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingCard from './ListingCard';
import { fetchListings } from '@/app/actions/marketplace';

interface ListingsGridProps {
    initialListings: any[];
    role?: string;
    isLoggedIn?: boolean;
}

export default function ListingsGrid({ initialListings, isLoggedIn = false, role }: ListingsGridProps) {
    const [listings, setListings] = useState(initialListings);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const searchParams = useSearchParams();

    // Reset when initialListings changes (e.g. filters applied)
    useEffect(() => {
        setListings(initialListings);
        setPage(1);
        setHasMore(true);
    }, [initialListings]);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const nextPage = page + 1;

        // Convert searchParams to object
        const params: any = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        const res = await fetchListings(params, nextPage); // Pass params

        if (res.data && res.data.length > 0) {
            setListings([...listings, ...res.data]);
            setPage(nextPage);
        } else {
            setHasMore(false);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {listings.map((item) => (
                    <ListingCard key={item.id} item={item} isLoggedIn={isLoggedIn} userRole={role} />
                ))}
                {listings.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">No active listings found.</div>
                )}
            </div>

            {hasMore && listings.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-8 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Listings'}
                    </button>
                </div>
            )}
        </>
    );
}
