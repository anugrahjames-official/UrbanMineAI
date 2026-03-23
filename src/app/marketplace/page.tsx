import { fetchListings, fetchBounties, getFilterOptions } from '@/app/actions/marketplace';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/app/actions/user';

import ListingsGrid from '@/components/marketplace/ListingsGrid';
import BountiesGrid from '@/components/marketplace/BountiesGrid';
import Filters from '@/components/marketplace/Filters';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Package, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import SortDropdown from '@/components/marketplace/SortDropdown';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default async function MarketplacePage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Fetch profile for richer user info if logged in
    const profile = authUser ? await getUserProfile().catch(() => null) : null;

    const view = typeof searchParams.view === 'string' ? searchParams.view : 'listings';
    const isBountiesView = view === 'bounties';
    const isCreditsView = view === 'credits';

    // Fetch initial data based on view
    const listingsProp = !isBountiesView ? await fetchListings({ ...searchParams, view }) : { data: [], count: 0 };
    const bountiesProp = isBountiesView ? await fetchBounties(searchParams) : { data: [], count: 0 };

    // Fetch filter options dynamically
    const filterOptions = await getFilterOptions();
    const currentOptions = isBountiesView ? filterOptions.bounties : filterOptions.listings;

    const userRole = profile?.role || authUser?.user_metadata?.role;

    return (
        <div className="min-h-screen flex flex-col bg-background-dark">
            <Navbar user={authUser} profile={profile} />

            <main className="flex-1 pt-24 pb-12">
                <div className="max-w-[1600px] mx-auto px-6">
                    <Filters
                        materials={currentOptions.materials}
                        regions={currentOptions.regions}
                        grades={currentOptions.grades}
                        tiers={currentOptions.tiers}
                        view={isBountiesView ? 'bounties' : (isCreditsView ? 'credits' : 'listings')}
                    />

                    <div className="mt-6">
                        {/* Main Content Area */}
                        <section>
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl self-start overflow-x-auto no-scrollbar max-w-full">
                                    <Link
                                        href="?view=listings"
                                        scroll={false}
                                        className={cn(
                                            "px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                                            view === 'listings' ? "bg-[#19e66b] text-[#112117] shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Package size={16} /> Latest Listings
                                    </Link>
                                    <Link
                                        href="?view=credits"
                                        scroll={false}
                                        className={cn(
                                            "px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                                            view === 'credits' ? "bg-[#19e66b] text-[#112117] shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        EPR Credits
                                    </Link>
                                    <Link
                                        href="?view=bounties"
                                        scroll={false}
                                        className={cn(
                                            "px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                                            view === 'bounties' ? "bg-[#19e66b] text-[#112117] shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Target size={16} /> Open Bounties
                                    </Link>
                                </div>

                                <div className="flex items-center gap-3">
                                    {userRole === 'recycler' && view !== 'bounties' && (
                                        <Link href="/recycler/credits/new">
                                            <button className="bg-[#19e66b] hover:bg-[#16cc5f] text-[#112117] font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md text-sm">
                                                List EPR Credit
                                            </button>
                                        </Link>
                                    )}
                                    {userRole === 'recycler' && isBountiesView && (
                                        <Link href="/recycler/bounties/new">
                                            <button className="bg-[#19e66b] hover:bg-[#16cc5f] text-[#112117] font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md text-sm">
                                                <Target size={16} /> Post Bounty
                                            </button>
                                        </Link>
                                    )}

                                    <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
                                    <SortDropdown />
                                </div>
                            </div>

                            <Suspense fallback={<div className="text-white">Loading...</div>}>
                                {!isBountiesView ? (
                                    <ListingsGrid initialListings={listingsProp.data || []} role={userRole} isLoggedIn={!!authUser} />
                                ) : (
                                    <BountiesGrid initialBounties={bountiesProp.data || []} role={userRole} isLoggedIn={!!authUser} />
                                )}
                            </Suspense>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

