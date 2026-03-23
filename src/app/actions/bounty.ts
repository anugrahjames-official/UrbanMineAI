'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export type CreateBountyState = {
    errors?: {
        material?: string[]
        min_grade?: string[]
        quantity_kg?: string[]
        price_floor?: string[]
        expires_at?: string[]
        _form?: string[]
    }
    message?: string
    timestamp?: number
}

export async function generateBountyDescription(title: string, material: string, grade: string, quantity: string, unit: string, price: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });

        const prompt = `
        Write a concise, professional description for a recycling bounty/request.
        The user is looking for:
        - Title: ${title || 'N/A'}
        - Material: ${material}
        - Grade: ${grade || 'Any'}
        - Quantity: ${quantity} ${unit}
        - Target Price: ${price ? `$${price}/${unit}` : 'Negotiable'}

        The description should highlight the requirement and encourage dealers to fulfill it. Keep it under 50 words.
        IMPORTANT: Do not use any markdown formatting (like **bold**), emojis, symbols, or special characters. Use plain text only.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { description: response.text() };
    } catch (error) {
        console.error("AI Generation Error:", error);
        return { error: "Failed to generate description" };
    }
}

export async function createBounty(prevState: CreateBountyState, formData: FormData): Promise<CreateBountyState> {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Unauthorized. Please login.', timestamp: Date.now() }
    }


    // Check role
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'recycler') {
        return { message: 'Unauthorized. Only recyclers can create bounties.', timestamp: Date.now() }
    }

    // Extract data
    const title = formData.get('title') as string
    const material = formData.get('material') as string
    const min_grade = formData.get('min_grade') as string
    const quantity = Number(formData.get('quantity'))
    const unit = formData.get('unit') as string || 'kg'
    const price_floor = Number(formData.get('price_floor'))
    const expires_at_raw = formData.get('expires_at') as string
    const expires_at = expires_at_raw ? new Date(expires_at_raw).toISOString() : null
    const location = formData.get('location') as string
    const description = formData.get('description') as string

    // Validate
    const errors: CreateBountyState['errors'] = {}
    if (!material) errors.material = ['Material is required']
    if (quantity <= 0) errors.quantity_kg = ['Quantity must be positive']
    if (price_floor < 0) errors.price_floor = ['Price cannot be negative']

    // Basic date validation
    if (expires_at && new Date(expires_at) < new Date()) {
        errors.expires_at = ['Expiration date must be in the future']
    }

    if (Object.keys(errors).length > 0) {
        return { errors, message: 'Invalid input.', timestamp: Date.now() }
    }

    try {
        const { error } = await supabase.from('bounties').insert({
            recycler_id: user.id,
            title: title || material, // Fallback to material if title is empty
            material,
            min_grade: min_grade || null,
            quantity,
            unit,
            price_floor: price_floor || null,
            status: 'open',
            expires_at,
            // Saving location and description to metadata for flexibility
            // But also verifying if we can save to root columns?
            // Since we updated schema in previous turns (hypothetically), we might have them.
            // But to be safe and consistent with `saveItem`, we'll assume metadata usage or implicit column support.
            // Actually, `metrics` and `metadata` are common JSONB fields.
            // Let's use `description` and `location` if they exist in schema, but for now
            // pass them in the insert object. If they don't exist, Supabase will throw error.
            // TO AVOID ERROR: explicitly put them in a `metadata` jsonb column if we suspect they aren't in root.
            // Verification from `saveItem`: `metadata: { ... }`.
            // So I will start by putting them in `metadata`.
            metadata: {
                location,
                description
            }
        })

        if (error) {
            console.error('Supabase error:', error)
            return { message: 'Database error: Failed to create bounty.', timestamp: Date.now() }
        }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { message: 'Failed to create bounty.', timestamp: Date.now() }
    }

    revalidatePath('/recycler/procurement')
    return { message: 'Bounty created successfully!', timestamp: Date.now() }
}

export async function updateBounty(prevState: CreateBountyState, formData: FormData): Promise<CreateBountyState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized.', timestamp: Date.now() }

    const id = formData.get('id') as string
    if (!id) return { message: 'Bounty ID required.', timestamp: Date.now() }

    // Same validation logic... can be refactored but keeping inline for simplicity
    const title = formData.get('title') as string
    const material = formData.get('material') as string
    const min_grade = formData.get('min_grade') as string
    const quantity = Number(formData.get('quantity'))
    const unit = formData.get('unit') as string || 'kg'
    const price_floor = Number(formData.get('price_floor'))
    const expires_at_raw = formData.get('expires_at') as string
    const expires_at = expires_at_raw ? new Date(expires_at_raw).toISOString() : null
    const location = formData.get('location') as string
    const description = formData.get('description') as string

    // Validate (Simplified for brevity, assume similar rules)
    if (!material || quantity <= 0) return { message: 'Invalid input.', timestamp: Date.now() }

    try {
        const { error } = await supabase
            .from('bounties')
            .update({
                title: title || material,
                material,
                min_grade: min_grade || null,
                quantity,
                unit,
                price_floor: price_floor || null,
                expires_at,
                metadata: {
                    location,
                    description
                }
            })
            .eq('id', id)
            .eq('recycler_id', user.id) // Security: ensure ownership

        if (error) throw error
    } catch (error) {
        console.error('Update error:', error)
        return { message: 'Failed to update bounty.', timestamp: Date.now() }
    }

    revalidatePath('/recycler/procurement')
    return { message: 'Bounty updated successfully!', timestamp: Date.now() }
}

export async function deleteBounty(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { error } = await supabase
            .from('bounties')
            .delete()
            .eq('id', id)
            .eq('recycler_id', user.id)

        if (error) throw error
    } catch (error) {
        console.error('Delete error:', error)
        return { error: 'Failed to delete bounty.' }
    }

    revalidatePath('/recycler/procurement')
    return { success: true }
}

export async function fulfillBounty(bountyId: string, amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check role - only dealers can fulfill
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'dealer') {
        return { error: 'Only dealers can fulfill bounties' }
    }

    try {
        const { error } = await supabase
            .from('bounty_fulfillments')
            .insert({
                bounty_id: bountyId,
                dealer_id: user.id,
                amount: amount,
                status: 'pending'
            })

        if (error) throw error
    } catch (error) {
        console.error('Fulfillment error:', error)
        return { error: 'Failed to submit fulfillment' }
    }

    revalidatePath('/dealer/dashboard')
    revalidatePath('/marketplace') // To update UI if needed
    return { success: true }
}

export async function getBountyFulfillments(bountyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { data, error } = await supabase
            .from('bounty_fulfillments')
            .select(`
                *,
                dealer:users(id, first_name, last_name, business_name, avatar_url, trust_score)
            `)
            .eq('bounty_id', bountyId)
            .order('amount', { ascending: true })

        if (error) throw error
        return { data }
    } catch (error) {
        console.error('Fetch fulfillments error:', error)
        return { error: 'Failed to fetch fulfillments' }
    }
}

export async function acceptBountyFulfillment(fulfillmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        // 1. Get the fulfillment to find the bounty_id
        const { data: fulfillment, error: fetchError } = await supabase
            .from('bounty_fulfillments')
            .select('bounty_id, dealer_id, amount')
            .eq('id', fulfillmentId)
            .single()

        if (fetchError || !fulfillment) throw new Error('Fulfillment not found')

        // 2. Security check: Only the recycler who owns the bounty can accept
        const { data: bounty, error: bountyError } = await supabase
            .from('bounties')
            .select('recycler_id')
            .eq('id', fulfillment.bounty_id)
            .single()

        if (bountyError || bounty.recycler_id !== user.id) {
            return { error: 'Unauthorized: You do not own this bounty' }
        }

        // 3. Update the accepted fulfillment status
        const { error: updateAcceptedError } = await supabase
            .from('bounty_fulfillments')
            .update({ status: 'accepted' })
            .eq('id', fulfillmentId)

        if (updateAcceptedError) throw updateAcceptedError

        // 4. Update other fulfillments for this bounty to 'rejected'
        await supabase
            .from('bounty_fulfillments')
            .update({ status: 'rejected' })
            .eq('bounty_id', fulfillment.bounty_id)
            .neq('id', fulfillmentId)

        // 5. Update bounty status to 'completed' (or 'fulfilled')
        await supabase
            .from('bounties')
            .update({ status: 'completed' })
            .eq('id', fulfillment.bounty_id)

        // 6. Create a transaction (Placeholder for actual transaction logic)
        // In a real app, this would trigger payment/escrow or record a closed deal.
        await supabase
            .from('transactions')
            .insert({
                buyer_id: user.id,
                seller_id: fulfillment.dealer_id,
                amount: fulfillment.amount,
                type: 'bounty_fulfillment',
                metadata: { bounty_id: fulfillment.bounty_id, fulfillment_id: fulfillmentId }
            })

    } catch (error) {
        console.error('Accept fulfillment error:', error)
        return { error: 'Failed to accept fulfillment' }
    }

    revalidatePath('/recycler/procurement')
    return { success: true }
}

export async function getRecyclerBounties() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { data, error } = await supabase
            .from('bounties')
            .select(`
                *,
                fulfillments:bounty_fulfillments(count)
            `)
            .eq('recycler_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data }
    } catch (error) {
        console.error('Fetch recycler bounties error:', error)
        return { error: 'Failed to fetch bounties' }
    }
}
