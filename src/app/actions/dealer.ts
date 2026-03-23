'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserProfile } from './user'

interface ItemMetadata {
    category?: string;
    classification?: string;
    title?: string;
    description?: string;
    location?: string;
    weight?: string;
    estimatedValue?: string | number;
    grade?: string;
}

interface UserProfile {
    email: string;
    role: string;
    tier?: string;
}

export async function getDealerProfile() {
    const profile = await getUserProfile();

    return {
        name: profile.name,
        email: profile.email,
        trustScore: profile.trust_score,
        trustFlags: profile.trust_flags,
        tier: profile.tier,
        isVerified: profile.isVerified
    }
}

export async function getDealerInventory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching inventory:', error)
        return []
    }

    return items.map(item => {
        const meta = item.metadata as unknown as ItemMetadata
        return {
            id: item.id,
            title: meta?.title || meta?.classification || meta?.category || 'Unknown Item',
            description: meta?.description,
            weight: meta?.weight || 'N/A',
            value: meta?.estimatedValue || '$0',
            grade: meta?.grade || 'Ungraded',
            image: item.image_url,
            created_at: item.created_at,
            status: item.status,
            variant: meta?.grade?.includes('A') ? 'success' : meta?.grade?.includes('B') ? 'warning' : 'error'
        }
    })
}

export async function getRecentDealerInventory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4)

    return items?.map(item => {
        const meta = item.metadata as unknown as ItemMetadata
        return {
            id: item.id,
            title: meta?.title || meta?.classification || meta?.category || 'Unknown Item',
            weight: meta?.weight || 'N/A',
            value: meta?.estimatedValue || '$0',
            grade: meta?.grade || 'Ungraded',
            image: item.image_url,
            created_at: item.created_at,
            variant: meta?.grade?.includes('A') ? 'success' : meta?.grade?.includes('B') ? 'warning' : 'error'
        }
    }) || []
}

export async function getDealerAnalytics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch items for GMV and rejected counts
    const { data: items } = await supabase
        .from('items')
        .select('metadata, status, created_at')
        .eq('user_id', user.id)

    let inventoryValue = 0
    const rejectedCount = 0 // Placeholder until we have a 'rejected' status or table
    let scannedToday = 0
    const today = new Date().toISOString().split('T')[0]

    // Initialize daily revenue for chart (last 7 days)
    const dailyRevenue = Array(7).fill(0)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const last7DaysLabels = []

    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        last7DaysLabels.push(days[d.getDay()])
    }

    // Composition Map
    const composition: Record<string, number> = {}
    let totalItems = 0
    let totalEwasteWeight = 0;

    items?.forEach(item => {
        const meta = item.metadata as unknown as ItemMetadata

        // GMV Calculation - Only count items that are NOT sold yet? Or all inventory value?
        // Usually "Inventory Value" implies current items on hand (pending/listed).
        if (item.status !== 'sold') {
            if (meta?.estimatedValue) {
                const val = typeof meta.estimatedValue === 'string'
                    ? parseFloat(meta.estimatedValue.replace(/[^0-9.]/g, ''))
                    : meta.estimatedValue
                if (!isNaN(val as number)) inventoryValue += (val as number)
            }
        }

        // E-Waste Weight Calculation
        if (meta?.weight) {
            const weightVal = typeof meta.weight === 'string'
                ? parseFloat(meta.weight.replace(/[^0-9.]/g, ''))
                : Number(meta.weight);

            if (!isNaN(weightVal)) totalEwasteWeight += weightVal
        }

        if (item.created_at.startsWith(today)) {
            scannedToday++
        }

        // Composition
        const category = meta?.classification || meta?.title || meta?.category || 'Other'
        composition[category] = (composition[category] || 0) + 1
        totalItems++
    })

    // Transactions Count
    const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .or(`supplier_id.eq.${user.id},buyer_id.eq.${user.id}`)

    // Active Deals
    const { count: activeDeals } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .or(`supplier_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .in('status', ['negotiating', 'agreed', 'pending'])

    // Weekly Revenue (Completed Sales)
    const { data: completedSales } = await supabase
        .from('transactions')
        .select('created_at, price_total')
        .eq('supplier_id', user.id) // As a dealer, revenue comes from selling (supplier)
        .in('status', ['paid', 'completed'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    completedSales?.forEach(sale => {
        const date = new Date(sale.created_at)
        const dayIndex = 6 - Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
        if (dayIndex >= 0 && dayIndex < 7) {
            dailyRevenue[dayIndex] += Number(sale.price_total)
        }
    })

    // Formatting composition for chart
    const compositionData = Object.entries(composition).map(([label, count]) => ({
        label,
        value: totalItems > 0 ? `${Math.round((count / totalItems) * 100)}%` : '0%'
    })).sort((a, b) => parseInt(b.value) - parseInt(a.value)).slice(0, 4)

    // Avg Deal Time (Mock logic for now as we don't have historical closed deals to average yet)
    const avgDealTime = "N/A"

    return {
        inventoryValue,
        activeDeals: activeDeals || 0,
        transactionsCount: transactionsCount || 0,
        totalEwasteWeight,
        scannedToday,
        avgDealTime,
        rejectedCount,
        weeklyRevenue: dailyRevenue,
        weeklyLabels: last7DaysLabels,
        composition: compositionData
    }
}

export async function publishItems(itemIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a dealer
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'dealer') {
        throw new Error("Unauthorized. Only dealers can publish items.")
    }

    const { error } = await supabase
        .from('items')
        .update({ status: 'listed' })
        .in('id', itemIds)
        .eq('user_id', user.id) // Ensure user owns the items

    if (error) {
        console.error('Error publishing items:', error)
        throw new Error("Failed to publish items")
    }

    revalidatePath('/dealer/inventory')
    revalidatePath('/dealer/dashboard')
    revalidatePath('/marketplace')

    return { success: true }
}

export async function unpublishItems(itemIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a dealer
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'dealer') {
        throw new Error("Unauthorized. Only dealers can unpublish items.")
    }

    const { error } = await supabase
        .from('items')
        .update({ status: 'pending' })
        .in('id', itemIds)
        .eq('user_id', user.id) // Ensure user owns the items

    if (error) {
        console.error('Error unpublishing items:', error)
        throw new Error("Failed to unpublish items")
    }

    revalidatePath('/dealer/inventory')
    revalidatePath('/dealer/dashboard')
    revalidatePath('/marketplace')

    return { success: true }
}

export async function updateItemMetadata(itemId: string, metadata: Partial<ItemMetadata>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a dealer
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'dealer') {
        throw new Error("Unauthorized. Only dealers can update item metadata.")
    }

    // First fetch existing metadata to merge
    const { data: item, error: fetchError } = await supabase
        .from('items')
        .select('metadata')
        .eq('id', itemId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !item) {
        console.error('Error fetching item for update:', fetchError)
        throw new Error("Item not found")
    }

    const currentMetadata = item.metadata as unknown as ItemMetadata
    const newMetadata = { ...currentMetadata, ...metadata }

    const { error: updateError } = await supabase
        .from('items')
        .update({ metadata: newMetadata })
        .eq('id', itemId)
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Error updating item metadata:', updateError)
        throw new Error("Failed to update item")
    }

    revalidatePath('/dealer/inventory')
    revalidatePath('/dealer/dashboard')

    return { success: true }
}

export async function deleteInventoryItem(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a dealer
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'dealer') {
        throw new Error("Unauthorized. Only dealers can delete items.")
    }

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id) // Ensure user owns the item

    if (error) {
        console.error('Error deleting item:', error)
        throw new Error("Failed to delete item")
    }

    revalidatePath('/dealer/inventory')
    revalidatePath('/dealer/dashboard')

    return { success: true }
}

export async function getDealerActiveDeals() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Fetch direct transactions (Negotiations)
    const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select(`
            *,
            buyer:users!buyer_id (
                business_name,
                first_name,
                last_name,
                avatar_url
            )
        `)
        .eq('supplier_id', user.id)
        .in('status', ['negotiating', 'agreed', 'pending'])
        .order('created_at', { ascending: false })

    if (transError) {
        console.error('Error fetching dealer transactions:', transError)
    }

    // 2. Fetch auction bids directly from bids table (inner join with dealer's items)
    const { data: rawBids, error: bidsError } = await supabase
        .from('bids')
        .select(`
            *,
            item:items!inner (
                id,
                user_id,
                metadata
            ),
            buyer:users!bidder_id (
                business_name,
                first_name,
                last_name,
                avatar_url
            )
        `)
        .eq('item.user_id', user.id)
        .order('amount', { ascending: false });

    if (bidsError) {
        console.error('Error fetching dealer bids:', bidsError)
    }

    // 3. Combine and group targets
    const finalDealsMap = new Map();
    
    // Add transactions first
    (transactions || []).forEach((deal: any) => {
        finalDealsMap.set(`trans_${deal.id}`, {
            ...deal,
            item_title: deal.material_breakdown?.title || 'Material Lot'
        });
    });
    
    // Add bids (grouping by item_id, keeping only the highest bid)
    (rawBids || []).forEach((bid: any) => {
        const itemId = bid.item_id;
        const key = `item_${itemId}`;
        if (!finalDealsMap.has(key) || finalDealsMap.get(key).price_total < bid.amount) {
            finalDealsMap.set(key, {
                id: itemId,
                isAuction: true,
                created_at: bid.created_at,
                price_total: bid.amount,
                status: 'negotiating',
                buyer: bid.buyer || { business_name: bid.bidder_alias || 'Unknown Bidder' },
                item_title: bid.item?.metadata?.title || 'Auction Item'
            });
        }
    });

    // Return combined list sorted by most recent activity
    return Array.from(finalDealsMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}
