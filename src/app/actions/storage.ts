'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAvatarUploadUrl(fileName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase
        .storage
        .from('avatars')
        .createSignedUploadUrl(filePath)

    if (error) {
        console.error('Error creating signed upload URL:', error)
        throw new Error("Failed to get upload URL")
    }

    return {
        signedUrl: data.signedUrl,
        path: data.path,
        token: data.token
    }
}
