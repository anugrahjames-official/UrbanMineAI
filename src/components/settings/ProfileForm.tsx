'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { User, Copy, MapPin } from '@/components/icons'
import { type UserProfile, updateUserFullProfile } from '@/app/actions/user'
import { toast } from 'sonner'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { useRouter } from 'next/navigation'
import { SettingsForm } from './SettingsForm'

interface ProfileFormProps {
    user: UserProfile
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()

    // Combined state for profile info and preferences
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        business_name: user.business_name || '',
        location: user.location || '',
        theme_dark: user.theme_dark,
        push_notifications: user.push_notifications,
        email_updates: user.email_updates,
        security_alerts: user.security_alerts
    })

    const [isPending, setIsPending] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Handler for text inputs
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setHasChanges(true)
    }

    // Handler for preferences
    const handlePreferenceChange = (key: string, value: boolean) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        setHasChanges(true)
    }

    const handleCancel = () => {
        setFormData({
            first_name: user.first_name || '',
            middle_name: user.middle_name || '',
            last_name: user.last_name || '',
            business_name: user.business_name || '',
            location: user.location || '',
            theme_dark: user.theme_dark,
            push_notifications: user.push_notifications,
            email_updates: user.email_updates,
            security_alerts: user.security_alerts
        })
        setHasChanges(false)
        toast.info('Changes reverted')
    }

    const handleSave = async () => {
        setIsPending(true)
        try {
            await updateUserFullProfile(formData)
            toast.success('Profile and preferences updated')
            setHasChanges(false)
            router.refresh()
        } catch (error) {
            toast.error('Failed to update profile')
            console.error(error)
        } finally {
            setIsPending(false)
        }
    }

    const copyUserId = () => {
        navigator.clipboard.writeText(user.id)
        toast.success('User ID copied to clipboard')
    }

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <User size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Name</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="First Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Middle Name</label>
                        <input
                            type="text"
                            value={formData.middle_name}
                            onChange={(e) => handleChange('middle_name', e.target.value)}
                            className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Middle Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Name</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Last Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full bg-background-dark/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Organization Name</label>
                        <input
                            type="text"
                            value={formData.business_name}
                            onChange={(e) => handleChange('business_name', e.target.value)}
                            className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Organization Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">User ID</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                disabled
                                value={user.id.slice(0, 12).toUpperCase()}
                                className="w-full bg-background-dark/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                            />
                            <Button variant="secondary" size="icon" onClick={copyUserId} className="shrink-0 rounded-xl border-white/10 bg-surface-dark/20">
                                <Copy size={16} />
                            </Button>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Primary Office Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className="w-full bg-background-dark/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <SettingsForm
                preferences={{
                    theme_dark: formData.theme_dark,
                    push_notifications: formData.push_notifications,
                    email_updates: formData.email_updates,
                    security_alerts: formData.security_alerts
                }}
                onPreferenceChange={handlePreferenceChange}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
                <SignOutButton />
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={!hasChanges || isPending}
                        className="flex-1 sm:flex-none border-white/10 hover:bg-white/5 disabled:opacity-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isPending}
                        className="flex-1 sm:flex-none bg-primary text-background-dark hover:bg-primary/90 shadow-glow-primary disabled:opacity-50 disabled:shadow-none"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
