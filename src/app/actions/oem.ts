'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOEMComplianceStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Verify user is an OEM
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'oem') {
        return null
    }

    // Pending Verification: negotiated or agreed deals that are not yet paid/completed?
    // Or strictly "Docs" pending verification? The dashboard says "Docs".
    // But we don't have a docs verif flow yet. Let's use Transactions in 'agreed' state as "Pending Verification" implies pending finalization.
    const { count: pendingVerification } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['negotiating', 'agreed'])

    // Credits Acquired: Sum of quantity from completed transactions
    // We need to parse material_breakdown or use a simplified quantity field if added.
    // For now, let's assume `price_total` maps roughly to quantity or just count deals as a proxy if we can't parse JSON easily in SQL here.
    // Better: Fetch completed transactions and sum up client-side.
    const { data: completedDeals } = await supabase
        .from('transactions')
        .select('material_breakdown, price_total')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'completed'])

    let creditsAcquired = 0
    completedDeals?.forEach(deal => {
        // Try to parse breakdown if it exists, else use a fallback (e.g. 1 unit per deal? or price/10?)
        // Let's just use price as a proxy for "volume" if breakdown is missing for MVP.
        // Or if we have `items` linked, we could sum their weight.
        // Simplified: just return 0 if no explicit data, or count deals.
        // Let's try to sum 'quantity' if we had it.
        // Actually, let's just count the number of completed deals * 100 as "credits" for demo purposes 
        // until we have strict weight tracking in transactions.
        creditsAcquired += 100 // Mock multiplier for demo 'real' data
    })

    // Target is hardcoded for now
    const target = 10000
    const compliancePercentage = Math.min(Math.round((creditsAcquired / target) * 100), 100)

    // Savings: Mock calculation based on credits
    const savings = creditsAcquired * 0.15 // $0.15 per unit?

    return {
        compliancePercentage,
        pendingVerification: pendingVerification || 0,
        creditsAcquired,
        savings
    }
}

export async function getComplianceLogs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Verify user is an OEM
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'oem') {
        return []
    }

    // Fetch transactions as logs
    const { data: logs } = await supabase
        .from('transactions')
        .select('*, supplier:users!supplier_id(email)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return logs?.map(log => ({
        id: log.id,
        created_at: log.created_at,
        status: ['paid', 'completed'].includes(log.status) ? 'verified' : 'pending',
        supplier: log.supplier,
        metadata: {
            category: 'E-Waste Batch', // Generic for now
            quantity: 100 // Placeholder
        }
    })) || []
}
