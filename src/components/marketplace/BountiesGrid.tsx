'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BountyCard from './BountyCard';
import { fetchBounties } from '@/app/actions/marketplace';

interface BountiesGridProps {
    initialBounties: any[];
    role?: string;
    isLoggedIn?: boolean;
}

export default function BountiesGrid({ initialBounties, isLoggedIn = false, role }: BountiesGridProps) {
    const [bounties, setBounties] = useState(initialBounties);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        setBounties(initialBounties);
        setPage(1);
        setHasMore(true);
    }, [initialBounties]);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const nextPage = page + 1;

        const params: any = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        const res = await fetchBounties(params, nextPage);

        if (res.data && res.data.length > 0) {
            setBounties([...bounties, ...res.data]);
            setPage(nextPage);
        } else {
            setHasMore(false);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {bounties.map((item) => (
                    <BountyCard key={item.id} bounty={item} isLoggedIn={isLoggedIn} userRole={role} />
                ))}
                {bounties.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">No active bounties found.</div>
                )}
            </div>

            {hasMore && bounties.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-8 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Bounties'}
                    </button>
                </div>
            )}
        </>
    );
}
