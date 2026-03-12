'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchListings(filters: any = {}, page: number = 1, limit: number = 12) {
    const supabase = await createClient();

    // Start building the query
    let query = supabase
        .from('items')
        .select(`
            *,
            users (
                business_name,
                first_name,
                last_name,
                location,
                trust_score,
                tier,
                role,
                avatar_url,
                trust_flags
            ),
            bids (
                amount,
                id,
                created_at,
                bidder_alias,
                bidder_id,
                users (
                    business_name,
                    first_name,
                    last_name,
                    trust_score,
                    avatar_url
                )
            )
        `, { count: 'exact' })
        .eq('status', 'listed')
        .range((page - 1) * limit, page * limit - 1);

    // Apply sorting
    if (filters.sort === 'price_high') {
        query = query.order('price', { ascending: false });
    } else if (filters.sort === 'price_low') {
        query = query.order('price', { ascending: true });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    // Apply filters - Use 'l_' prefix for listings
    const materialType = filters.l_materialType || filters.materialType;
    const purityGrade = filters.l_purityGrade || filters.purityGrade;
    const q = filters.l_q || filters.q;
    const region = filters.l_region || filters.region;
    const verificationLevel = filters.l_verificationLevel || filters.verificationLevel;

    if (materialType && materialType !== 'All') {
        query = query.ilike('metadata->>category', `%${materialType}%`);
    }

    if (purityGrade && purityGrade !== 'All') {
        query = query.ilike('metadata->>grade', `%${purityGrade}%`);
    }

    if (q) {
        query = query.or(`metadata->>title.ilike.%${q}%,metadata->>description.ilike.%${q}%`);
    }

    if (region && region !== 'All') {
        query = query.filter('users.location', 'ilike', `%${region}%`);
    }

    if (verificationLevel && verificationLevel !== 'All') {
        query = query.filter('users.tier', 'ilike', `%${verificationLevel}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching listings:', error.message || error);
        return { data: [], error: error.message };
    }

    return { data, count };
}

export async function fetchBounties(filters: any = {}, page: number = 1, limit: number = 12) {
    const supabase = await createClient();

    let query = supabase
        .from('bounties')
        .select(`
            *,
            users:recycler_id (
                business_name,
                first_name,
                last_name,
                location,
                trust_score,
                role,
                avatar_url,
                tier,
                trust_flags
            )
        `, { count: 'exact' })
        .eq('status', 'open')
        .range((page - 1) * limit, page * limit - 1);

    // Apply sorting
    if (filters.sort === 'price_high') {
        query = query.order('budget', { ascending: false });
    } else if (filters.sort === 'price_low') {
        query = query.order('budget', { ascending: true });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    // Apply filters - Use 'b_' prefix for bounties
    const materialType = filters.b_materialType || filters.materialType;
    const purityGrade = filters.b_purityGrade || filters.purityGrade;
    const q = filters.b_q || filters.q;
    const region = filters.b_region || filters.region;
    const verificationLevel = filters.b_verificationLevel || filters.verificationLevel;

    if (materialType && materialType !== 'All') {
        query = query.ilike('material', `%${materialType}%`);
    }

    if (purityGrade && purityGrade !== 'All') {
        query = query.ilike('min_grade', `%${purityGrade}%`);
    }

    if (q) {
        query = query.ilike('material', `%${q}%`);
    }

    if (region && region !== 'All') {
        query = query.filter('users.location', 'ilike', `%${region}%`);
    }

    if (verificationLevel && verificationLevel !== 'All') {
        query = query.filter('users.tier', 'ilike', `%${verificationLevel}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching bounties:', error);
        return { data: [], error: error.message };
    }

    return { data, count };
}

export async function getFilterOptions() {
    const supabase = await createClient();

    // Fetch unique values for filters
    const { data: itemData } = await supabase.from('items').select('metadata').eq('status', 'listed');
    const { data: bountyData } = await supabase.from('bounties').select('material, min_grade').eq('status', 'open');
    const { data: userData } = await supabase.from('users').select('location, tier');

    // Separate sets for listings
    const listingMaterials = new Set(['All']);
    const listingGrades = new Set(['All']);
    const listingRegions = new Set(['All']);
    const listingTiers = new Set(['All']);

    // Separate sets for bounties
    const bountyMaterials = new Set(['All']);
    const bountyGrades = new Set(['All']);
    const bountyRegions = new Set(['All']);
    const bountyTiers = new Set(['All']);

    itemData?.forEach(item => {
        const meta = item.metadata as any;
        if (meta?.category) listingMaterials.add(meta.category);
        if (meta?.grade) listingGrades.add(meta.grade);
    });

    bountyData?.forEach(bounty => {
        if (bounty.material) bountyMaterials.add(bounty.material);
        if (bounty.min_grade) bountyGrades.add(bounty.min_grade);
    });

    // For regions and tiers, we might want to only show those where users have active content of that type
    // But for now, we'll keep them shared but separate for potential future optimization
    userData?.forEach(user => {
        if (user.location) {
            listingRegions.add(user.location);
            bountyRegions.add(user.location);
        }
        if (user.tier) {
            listingTiers.add(user.tier);
            bountyTiers.add(user.tier);
        }
    });

    return {
        listings: {
            materials: Array.from(listingMaterials).sort(),
            grades: Array.from(listingGrades).sort(),
            regions: Array.from(listingRegions).sort(),
            tiers: Array.from(listingTiers).sort()
        },
        bounties: {
            materials: Array.from(bountyMaterials).sort(),
            grades: Array.from(bountyGrades).sort(),
            regions: Array.from(bountyRegions).sort(),
            tiers: Array.from(bountyTiers).sort()
        }
    };
}

export async function placeBid(itemId: string, amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to place a bid');
    }

    // First check if the user is a recycler
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userError || userData?.role !== 'recycler') {
        throw new Error('Only verified recyclers can place bids');
    }

    // Get the item to check status and current bid
    const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*, bids(amount)')
        .eq('id', itemId)
        .single();

    if (itemError || !item) {
        throw new Error('Item not found');
    }

    const currentBid = item.current_bid || 0;

    if (amount <= currentBid) {
        throw new Error('Bid must be higher than the current bid');
    }

    // Insert the bid
    const { data: newBid, error: bidError } = await supabase
        .from('bids')
        .insert({
            item_id: itemId,
            bidder_id: user.id,
            amount: amount,
            bidder_alias: `Recycler_${user.id.slice(0, 4)}` // Simplified alias for now
        })
        .select()
        .single();

    if (bidError) {
        console.error('Bid insertion error:', bidError);
        throw new Error('Failed to place bid');
    }

    // Update the item's current bid
    await supabase
        .from('items')
        .update({ current_bid: amount })
        .eq('id', itemId);

    revalidatePath('/marketplace');
    revalidatePath(`/item/${itemId}`);

    return { success: true, bid: newBid };
}



export async function incrementViewCount(itemId: string) {
    const supabase = await createClient();

    // Get current metadata
    const { data: item, error: fetchError } = await supabase
        .from('items')
        .select('metadata')
        .eq('id', itemId)
        .single();

    if (fetchError || !item) {
        return; // Silent fail for view counts
    }

    const currentMetadata = item.metadata as any || {};
    const currentViews = currentMetadata.views || 0;
    const newViews = currentViews + 1;

    // Update with new view count
    await supabase
        .from('items')
        .update({
            metadata: {
                ...currentMetadata,
                views: newViews
            }
        })
        .eq('id', itemId);

    revalidatePath(`/marketplace`);
    // We don't revalidate the specific item path here to avoid full page reload if not needed, 
    // but for real-time feel on other clients, it might be good. 
    // For now, let's keep it minimal.
}
