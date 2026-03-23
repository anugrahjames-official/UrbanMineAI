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

    // Pending Verification: transactions in 'agreed' or 'negotiating'
    const { count: pendingVerification } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['negotiating', 'agreed'])

    // Credits Acquired: Sum of weight from completed transactions
    const { data: completedDeals } = await supabase
        .from('transactions')
        .select('material_breakdown')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'completed'])

    let creditsAcquired = 0
    completedDeals?.forEach(deal => {
        const meta = deal.material_breakdown as { weight?: string } | null;
        if (meta?.weight) {
             const weightVal = parseFloat(meta.weight);
             if (!isNaN(weightVal)) {
                 creditsAcquired += weightVal;
             }
        }
    })

    // Target is hardcoded for now
    const target = 10000
    const compliancePercentage = Math.min(Math.round((creditsAcquired / target) * 100), 100)

    // Savings: calculation based on credits
    const savings = creditsAcquired * 0.15 

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

    return logs?.map(log => {
        const meta = log.material_breakdown as { category?: string, weight?: string } | null;
        let qty = 0;
        if (meta?.weight) {
            const w = parseFloat(meta.weight);
            if (!isNaN(w)) qty = w;
        }

        return {
            id: log.id,
            created_at: log.created_at,
            status: ['paid', 'completed'].includes(log.status || '') ? 'verified' : 'pending',
            supplier: log.supplier,
            metadata: {
                category: meta?.category || 'E-Waste Batch',
                quantity: qty
            }
        };
    }) || []
}

export async function getComplianceDocs() {
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

    // A doc belongs to a transaction to which the OEM is linked as the buyer
    // So we fetch docs and inner join with transactions where buyer is this OEM
    const { data: docs } = await supabase
        .from('docs')
        .select('*, transactions!inner(buyer_id)')
        .eq('transactions.buyer_id', user.id)
        .order('created_at', { ascending: false })

    return docs || []
}
