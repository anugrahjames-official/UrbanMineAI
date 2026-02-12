'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface UserProfile {
    id: string;
    email: string;
    role: string;
    name: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    full_name: string;
    trust_score: number;
    trust_flags: string[];
    tier?: string;
    business_name: string | null;
    phone_number: string | null;
    location: string | null;
    percentile?: number;
    totalUsers?: number;
    theme_dark: boolean;
    push_notifications: boolean;
    email_updates: boolean;
    security_alerts: boolean;
    isVerified: boolean;
}

import { checkTrustDecay } from './trust';

export async function getUserProfile(): Promise<UserProfile> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fire and forget decay check
    checkTrustDecay(user.id).catch(console.error)

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        // Fallback for cases where user row might not exist yet but session does
        return {
            id: user.id,
            email: user.email || '',
            role: '',
            name: user.email?.split('@')[0] || 'User',
            first_name: '',
            middle_name: '',
            last_name: '',
            full_name: user.email?.split('@')[0] || 'User',
            trust_score: 30,
            trust_flags: [],
            business_name: '',
            phone_number: '',
            location: '',
            percentile: 100,
            totalUsers: 1,
            theme_dark: true,
            push_notifications: true,
            email_updates: false,
            security_alerts: true,
            isVerified: false
        }
    }

    // Rank calculation logic
    const { data: allScores } = await supabase
        .from('users')
        .select('trust_score')
        .order('trust_score', { ascending: false })

    const trustScores = allScores?.map(u => u.trust_score || 0) || []
    const totalUsers = trustScores.length
    const userScore = profile.trust_score || 30

    // Percentile rank = (Rank / Total) * 100
    // If you are #1 (rank 1), you are in the top 1%
    const rank = trustScores.filter(s => s > userScore).length + 1
    const percentile = rank === 1 ? 1 : (totalUsers > 1 ? Math.ceil((rank / totalUsers) * 100) : 100)


    const firstName = profile.first_name || ''
    const middleName = profile.middle_name ? ` ${profile.middle_name}` : ''
    const lastName = profile.last_name ? ` ${profile.last_name}` : ''
    const fullName = profile.first_name
        ? `${firstName}${middleName}${lastName}`.trim()
        : profile.email?.split('@')[0] || 'User'

    // Check if user is verified based on trust_flags
    // We assume 'verified' is the flag string. 
    // If trust_flags is jsonb in DB, it comes as string[] here if defined in interface, but let's be safe.
    const flags = Array.isArray(profile.trust_flags) ? profile.trust_flags : [];
    const isVerified = flags.includes('verified');

    return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        name: fullName,
        full_name: fullName,
        trust_score: profile.trust_score ?? 30,
        trust_flags: flags,
        tier: profile.tier || 'Newbie',
        business_name: profile.business_name || '',
        phone_number: profile.phone_number || '',
        location: profile.location || '',
        theme_dark: profile.theme_dark ?? true,
        push_notifications: profile.push_notifications ?? true,
        email_updates: profile.email_updates ?? false,
        security_alerts: profile.security_alerts ?? true,
        percentile,
        totalUsers,
        isVerified
    }
}

export async function updatePreferences(preferences: Partial<Pick<UserProfile, 'theme_dark' | 'push_notifications' | 'email_updates' | 'security_alerts'>>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('users')
        .update(preferences)
        .eq('id', user.id)

    if (error) {
        throw new Error(error.message)
    }


    const { revalidatePath } = await import('next/cache')
    revalidatePath('/')

    return { success: true }
}

export async function updateUserProfile(data: Partial<Pick<UserProfile, 'first_name' | 'middle_name' | 'last_name' | 'business_name' | 'location'>>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath('/')

    return { success: true }
}

export async function updateUserFullProfile(data: Partial<Pick<UserProfile, 'first_name' | 'middle_name' | 'last_name' | 'business_name' | 'location' | 'theme_dark' | 'push_notifications' | 'email_updates' | 'security_alerts'>>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath('/')

    return { success: true }
}
