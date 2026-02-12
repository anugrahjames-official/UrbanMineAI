'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TrustHistoryItem {
    id: string;
    amount: number;
    reason: string;
    created_at: string;
    is_appealable: boolean;
    transaction_id?: string;
}

/**
 * Updates a user's trust score and logs the history.
 * @param userId - The ID of the user to update.
 * @param change - The amount to change the score by (positive or negative).
 * @param reason - The reason for the change.
 * @param transactionId - Optional transaction ID associated with the change.
 * @param isAppealable - Whether this penalty can be appealed.
 */
export async function updateTrustScore(
    userId: string,
    change: number,
    reason: string,
    transactionId?: string,
    isAppealable: boolean = false
) {
    const supabase = await createClient()

    // 1. Fetch current score
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('trust_score, trust_flags')
        .eq('id', userId)
        .single()

    if (userError || !user) {
        console.error('Error fetching user for trust update:', userError)
        return { success: false, error: 'User not found' }
    }

    let newScore = (user.trust_score || 30) + change

    // Clamp score between 0 and 100
    if (newScore > 100) newScore = 100
    if (newScore < 0) newScore = 0

    // 2. Log History
    const { error: historyError } = await supabase
        .from('trust_history')
        .insert({
            user_id: userId,
            amount: change,
            reason: reason,
            transaction_id: transactionId,
            is_appealable: isAppealable && change < 0 // Only negative changes are appealable
        })

    if (historyError) {
        console.error('Error logging trust history:', historyError)
        return { success: false, error: 'Failed to log history' }
    }

    // 3. Update User Score
    const { error: updateError } = await supabase
        .from('users')
        .update({ trust_score: newScore })
        .eq('id', userId)

    if (updateError) {
        console.error('Error updating trust score:', updateError)
        return { success: false, error: 'Failed to update score' }
    }

    revalidatePath('/dealer/dashboard')
    revalidatePath('/recycler/dashboard') // Assuming recycler dashboard exists
    return { success: true, newScore }
}

/**
 * Fetches the trust history for a user.
 */
export async function getTrustHistory(userId: string): Promise<TrustHistoryItem[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('trust_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching trust history:', error)
        return []
    }

    return data as TrustHistoryItem[]
}

/**
 * Submits an appeal for a trust score penalty.
 */
export async function submitAppeal(historyId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Verify history belongs to user and is appealable
    const { data: history } = await supabase
        .from('trust_history')
        .select('*')
        .eq('id', historyId)
        .eq('user_id', user.id)
        .single()

    if (!history || !history.is_appealable) {
        return { success: false, error: 'Invalid appeal request' }
    }

    const { error } = await supabase
        .from('appeals')
        .insert({
            history_id: historyId,
            user_id: user.id,
            reason: reason,
            status: 'pending'
        })

    if (error) {
        console.error('Error submitting appeal:', error)
        return { success: false, error: 'Failed to submit appeal' }
    }

    return { success: true }
}

/**
 * Checks for inactivity decay. Should be called on login/session start.
 * Decays 1 point for every 30 days of inactivity.
 */
export async function checkTrustDecay(userId: string) {
    const supabase = await createClient()

    const { data: user } = await supabase
        .from('users')
        .select('last_active_at, trust_score')
        .eq('id', userId)
        .single()

    if (!user || user.trust_score <= 30) return // Don't decay if already low or user not found

    const lastActive = new Date(user.last_active_at || Date.now())
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastActive.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 30) {
        const decayPoints = Math.floor(diffDays / 30)
        if (decayPoints > 0) {
            await updateTrustScore(userId, -decayPoints, `Inactivity decay (${diffDays} days)`, undefined, false)
        }
    }

    // Update last_active_at
    await supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', userId)
}
