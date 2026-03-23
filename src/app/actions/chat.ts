
'use server'

import { createClient } from "@/lib/supabase/server"

export async function getOrCreateChatTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Check if it's already a valid transaction ID
    const { data: transaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('id', id)
        .single()

    if (transaction) return transaction.id

    // 2. Check if it's a Bid ID (Recycler Dashboard case)
    const { data: bid } = await supabase
        .from('bids')
        .select('*, item:items!item_id(*)')
        .eq('id', id)
        .single()

    if (bid) {
        // Resolve transaction between bidder and supplier
        const buyerId = bid.bidder_id
        const supplierId = bid.item.user_id
        const itemId = bid.item_id

        // Check for existing transaction
        const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('buyer_id', buyerId)
            .eq('supplier_id', supplierId)
            .contains('item_ids', [itemId])
            .single()

        if (existingTx) return existingTx.id

        // Create new transaction
        const { data: newTx, error: createError } = await supabase
            .from('transactions')
            .insert({
                buyer_id: buyerId,
                supplier_id: supplierId,
                item_ids: [itemId],
                price_total: bid.amount,
                status: 'negotiating',
                material_breakdown: bid.item.metadata
            })
            .select('id')
            .single()

        if (createError) {
            console.error('Error creating transaction from bid:', JSON.stringify(createError))
            throw new Error(`Failed to initialize negotiation: ${createError.message || 'Unknown database error'}`)
        }
        return newTx.id
    }

    // 3. Check if it's an Item ID (Dealer Dashboard case)
    const { data: item } = await supabase
        .from('items')
        .select('*, bids(*)')
        .eq('id', id)
        .single()

    if (item && item.user_id === user.id) {
        // Find highest bidder for this item
        const highestBid = (item.bids || []).sort((a: any, b: any) => b.amount - a.amount)[0]

        if (!highestBid) {
            throw new Error('No bids found for this item to start a chat.')
        }

        const buyerId = highestBid.bidder_id
        const supplierId = item.user_id
        const itemId = item.id

        // Check for existing transaction
        const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('buyer_id', buyerId)
            .eq('supplier_id', supplierId)
            .contains('item_ids', [itemId])
            .single()

        if (existingTx) return existingTx.id

        // Create new transaction
        const { data: newTx, error: createError } = await supabase
            .from('transactions')
            .insert({
                buyer_id: buyerId,
                supplier_id: supplierId,
                item_ids: [itemId],
                price_total: highestBid.amount,
                status: 'negotiating',
                material_breakdown: item.metadata
            })
            .select('id')
            .single()

        if (createError) {
            console.error('Error creating transaction from item:', JSON.stringify(createError))
            throw new Error(`Failed to initialize negotiation: ${createError.message || 'Unknown database error'}`)
        }
        return newTx.id
    }

    throw new Error('Transaction context not found')
}
