'use client'

import { useState, useRef } from 'react'
import { Settings as SettingsIcon, Trash2 } from "@/components/icons"
import { getAvatarUploadUrl } from '@/app/actions/storage'
import { updateUserFullProfile, UserProfile } from '@/app/actions/user'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface AvatarUploadProps {
    user: UserProfile;
    dealerName?: string;
}

export function AvatarUpload({ user, dealerName }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size should be less than 5MB')
            return
        }

        try {
            setIsUploading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `avatar-${Date.now()}.${fileExt}`

            // Client Side Upload
            const supabase = createClient()
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`${user.id}/${fileName}`, file, {
                    upsert: true
                })

            if (uploadError) {
                console.error('Upload Error:', uploadError)
                throw new Error('Failed to upload image')
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(uploadData.path)

            // Update user profile
            await updateUserFullProfile({ avatar_url: publicUrl })

            toast.success('Profile picture updated')
            router.refresh()

        } catch (error) {
            console.error(error)
            toast.error('Failed to update profile picture')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        try {
            setIsUploading(true)
            await updateUserFullProfile({ avatar_url: null })
            toast.success('Profile picture removed')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Failed to remove profile picture')
        } finally {
            setIsUploading(false)
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="relative group">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <div className="w-24 h-24 relative">
                <UserAvatar
                    user={user}
                    className={`w-full h-full text-4xl ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                    fallbackClassName="w-10 h-10"
                />

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className="bg-background-dark text-primary p-1.5 rounded-full shadow-lg border border-primary/20 hover:bg-primary hover:text-background-dark transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload new picture"
                    >
                        <SettingsIcon size={12} />
                    </button>

                    {user.avatar_url && (
                        <button
                            onClick={handleRemoveAvatar}
                            disabled={isUploading}
                            className="bg-background-dark text-red-500 p-1.5 rounded-full shadow-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove picture"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
