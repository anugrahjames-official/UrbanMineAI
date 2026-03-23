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

    // Active Bids: Count of bids made by this recycler
    const { count: activeBids } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('bidder_id', user.id)

    // Lots Won Today: Transactions completed/paid today
    const today = new Date().toISOString().split('T')[0]
    const { data: wonDeals } = await supabase
        .from('transactions')
        .select('created_at, price_total')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'completed'])
        .gte('created_at', `${today}T00:00:00`)

    const lotsWonTodayFromTx = wonDeals?.length || 0

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

    const capitalDeployedFromTx = allPaidDeals?.reduce((sum, deal) => sum + Number(deal.price_total), 0) || 0

    // Fallback for dashboards when transaction insertion is unavailable:
    // rely on accepted bid metadata persisted on sold items.
    const { data: acceptedItemFallback } = await supabase
        .from('items')
        .select('metadata')
        .eq('status', 'sold')
        .eq('metadata->>acceptedBidderId', user.id)

    const acceptedWins = (acceptedItemFallback || [])
        .map((item) => (item.metadata as ItemMetadata) || {})
        .filter((meta) => meta.acceptedBidderId === user.id)

    const lotsWonTodayFallback = acceptedWins.filter((meta) => {
        if (!meta.acceptedAt) return false
        return meta.acceptedAt.startsWith(today)
    }).length

    const capitalDeployedFallback = acceptedWins.reduce((sum, meta) => {
        return sum + Number(meta.acceptedBidAmount || 0)
    }, 0)

    return {
        activeBids: activeBids || 0,
        lotsWonToday: Math.max(lotsWonTodayFromTx, lotsWonTodayFallback),
        pendingDelivery: pendingDelivery || 0,
        capitalDeployed: Math.max(capitalDeployedFromTx, capitalDeployedFallback)
    }
}

interface ItemMetadata {
    category?: string;
    weight?: string;
    estimatedValue?: string | number;
    grade?: string;
    type?: string;
    tags?: string[];
    reeContent?: Array<{ name: string; value: string; percentage: number }>;
    acceptedBidId?: string;
    acceptedBidderId?: string;
    acceptedBidAmount?: number | string;
    acceptedAt?: string;
}

export async function getRecyclerAcceptedDeals() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: acceptedTx } = await supabase
        .from('transactions')
        .select('id, created_at, item_ids, price_total, status, material_breakdown')
        .eq('buyer_id', user.id)
        .in('status', ['agreed', 'paid', 'completed'])
        .order('created_at', { ascending: false })
        .limit(6)

    return (acceptedTx || []).map((tx) => {
        const meta = (tx.material_breakdown as ItemMetadata) || {}
        return {
            itemId: tx.item_ids?.[0] || tx.id,
            title: meta.category || 'Material Lot',
            location: 'From Dealer',
            acceptedBidAmount: Number(tx.price_total || meta.acceptedBidAmount || 0),
            acceptedAt: tx.created_at
        }
    })
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
            isEprCredit: meta?.type === 'epr_credit' || (Array.isArray(meta?.tags) && meta.tags.includes('EPR Credit')),
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
        .select(`
            *,
            bids (
                id,
                amount,
                created_at,
                bidder_alias,
                users (
                    id,
                    first_name,
                    last_name,
                    business_name,
                    avatar_url,
                    trust_score
                )
            )
        `)
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

export async function placeBid(itemId: string, amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Verify user is a recycler or oem (any buyer)
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'recycler' && profile.role !== 'oem')) {
        throw new Error("Unauthorized. Only buyers can place bids.")
    }

    // Call the generic marketplace bid action
    const { placeBid: marketplaceBid } = await import('./marketplace')
    return await marketplaceBid(itemId, amount)
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
            image_url: '', // No images for EPR credits as per requirement
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
