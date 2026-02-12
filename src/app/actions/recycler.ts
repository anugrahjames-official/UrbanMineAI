'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRecyclerDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

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
            id: item.id.substring(0, 8), // Short ID
            title: meta?.category || 'Unknown Item',
            location: userLoc || 'Unknown Location',
            weight: meta?.weight || 'N/A',
            value: meta?.estimatedValue || 'Unknown',
            created_at: item.created_at,
            grade: meta?.grade || 'N/A',
            image: item.image_url
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
