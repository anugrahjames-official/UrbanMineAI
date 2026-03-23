'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getRecyclerDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Verify user is a recycler
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'recycler') {
        return null
    }

    // Active Bids: Count of transactions where recycler is buyer and status is negotiating
    const { count: activeBids } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('status', 'negotiating')

    // Lots Won Today: Transactions completed/paid today
    const today = new Date().toISOString().split('T')[0]
    const { data: wonDeals } = await supabase
        .from('transactions')
        .select('created_at, price_total')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'completed'])
        .gte('created_at', `${today}T00:00:00`)

    const lotsWonToday = wonDeals?.length || 0

    // Pending Delivery: status paid but not completed?
    const { count: pendingDelivery } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('status', 'paid')

    // Capital Deployed: Sum of all time paid transactions? Or this session?
    // "this session" is hard to track. Let's do "Today" or "Total".
    // For now, let's do Total Capital Deployed to show a big number, or Today if we want "velocity".
    // valid status: paid, completed
    const { data: allPaidDeals } = await supabase
        .from('transactions')
        .select('price_total')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'completed'])

    const capitalDeployed = allPaidDeals?.reduce((sum, deal) => sum + Number(deal.price_total), 0) || 0

    return {
        activeBids: activeBids || 0,
        lotsWonToday,
        pendingDelivery: pendingDelivery || 0,
        capitalDeployed
    }
}

interface ItemMetadata {
    category?: string;
    weight?: string;
    estimatedValue?: string | number;
    grade?: string;
    reeContent?: Array<{ name: string; value: string; percentage: number }>;
}

export async function getMarketplaceItems() {
    const supabase = await createClient()

    // items with status 'listed'
    const { data: items } = await supabase
        .from('items')
        .select('*, users(location)') // Join with users to get location
        .eq('status', 'listed')
        .order('created_at', { ascending: false })
        .limit(10)

    return items?.map(item => {
        const meta = item.metadata as unknown as ItemMetadata
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userLoc = (item.users as any)?.location

        return {
            id: item.id, // Full UUID
            shortId: item.id.substring(0, 8), // Short ID for display
            title: meta?.category || 'Unknown Item',
            location: userLoc || 'Unknown Location',
            weight: meta?.weight || 'N/A',
            value: meta?.estimatedValue || 'Unknown',
            created_at: item.created_at,
            grade: meta?.grade || 'N/A',
            image: item.image_url,
            composition: meta?.reeContent || []
        }
    }) || []
}

export async function getRecyclerProcurement() {
    const supabase = await createClient()
    // Fetch bounties
    const { data: bounties } = await supabase
        .from('bounties')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

    return bounties || []
}

export async function getRecyclerInventory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return items || []
}

export async function getRecyclerLogistics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch transactions where recycler is buyer and status is 'paid' (pending delivery)
    const { data: deliveries } = await supabase
        .from('transactions')
        .select('*, supplier:users!supplier_id(location)')
        .eq('buyer_id', user.id)
        .in('status', ['paid'])
        .order('created_at', { ascending: true })

    return deliveries || []
}

export async function placeBid(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Verify user is a recycler
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'recycler') {
        throw new Error("Unauthorized. Only recyclers can place bids.")
    }

    // Get item details
    const { data: item } = await supabase
        .from('items')
        .select('user_id, metadata')
        .eq('id', itemId)
        .single()

    if (!item) throw new Error("Item not found")

    // Check if open transaction exists
    const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('buyer_id', user.id)
        .contains('item_ids', [itemId])
        .in('status', ['negotiating', 'agreed', 'pending'])
        .single()

    if (existing) {
        redirect(`/recycler/negotiate/${existing.id}`)
    }

    // Create new transaction
    const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
            supplier_id: item.user_id, // Dealer
            buyer_id: user.id, // Recycler
            item_ids: [itemId],
            price_total: 0, // Initial bid 0 or parsed from metadata
            status: 'negotiating',
            // Ensure we're passing a plain object for jsonb
            material_breakdown: { ...(item.metadata as any) }
        })
        .select()
        .single()

    if (error) {
        console.error("Bid Error Details:", error)
        throw new Error(`Failed to place bid: ${error.message}`)
    }

    redirect(`/recycler/negotiate/${transaction.id}`)
}

export async function listEprCredit(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'recycler') {
        throw new Error("Only recyclers can list EPR credits");
    }

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const weight = formData.get('weight') as string;
    const estimatedValue = formData.get('estimatedValue') as string;
    const description = formData.get('description') as string;

    const { data: item, error } = await supabase
        .from('items')
        .insert({
            user_id: user.id,
            status: 'listed',
            metadata: {
                type: 'epr_credit',
                title,
                category,
                weight,
                estimatedValue,
                description,
                tags: ['EPR Credit', 'Verified Recycled']
            }
        })
        .select()
        .single();

    if (error) {
        console.error("Listing Error Details:", error);
        throw new Error(`Failed to list EPR credit: ${error.message}`);
    }
    
    redirect('/marketplace');
}

export async function getRecyclerActiveBidsDetails() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { bids: [], totalValue: 0 }

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            supplier:users!supplier_id (
                business_name,
                first_name,
                last_name,
                avatar_url
            )
        `)
        .eq('buyer_id', user.id)
        .in('status', ['negotiating', 'agreed', 'pending'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching recycler active bids:', error)
        return { bids: [], totalValue: 0 }
    }

    // Also fetch the recycler's individual bids (Auctions)
    const { data: userBids, error: bidsError } = await supabase
        .from('bids')
        .select(`
            *,
            item:items (
                id,
                user_id,
                metadata,
                supplier:users (
                    business_name,
                    first_name,
                    last_name,
                    avatar_url
                )
            )
        `)
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false });

    if (bidsError) {
        console.error('Error fetching recycler individual bids:', bidsError)
    }

    // Process bids: group by item_id and take ONLY the highest bid per item
    const bidsMap = new Map();
    (userBids || []).forEach((bid: any) => {
        const itemId = bid.item_id;
        if (!bidsMap.has(itemId) || bidsMap.get(itemId).amount < bid.amount) {
            bidsMap.set(itemId, {
                id: bid.id,
                isAuction: true,
                created_at: bid.created_at,
                price_total: bid.amount,
                status: 'negotiating',
                supplier: bid.item?.supplier || { business_name: 'Unknown Supplier' },
                material_breakdown: { ...(bid.item?.metadata as any), title: bid.item?.metadata?.title || bid.item?.title || 'Auction Lot' },
                item_id: itemId
            });
        }
    });

    const auctionBids = Array.from(bidsMap.values());

    // Combine transactions and auction bids
    const combined = [...data, ...auctionBids].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calculate total value based only on highest bids/negotiations
    const totalValue = combined.reduce((sum, bid) => sum + Number(bid.price_total || 0), 0)

    return { bids: combined, totalValue };
}
