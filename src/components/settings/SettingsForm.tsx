'use client'

import { useState, useEffect, useTransition } from 'react'
import { Bell, Mail, ShieldCheck, Settings as SettingsIcon } from '@/components/icons'
import { updatePreferences, type UserProfile } from '@/app/actions/user'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

export function SettingsForm({ preferences, onPreferenceChange }: {
    preferences: {
        theme_dark: boolean
        push_notifications: boolean
        email_updates: boolean
        security_alerts: boolean
    }
    onPreferenceChange: (key: string, value: boolean) => void
}) {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Sync initial preference with theme on mount
    useEffect(() => {
        setMounted(true)
        // Only valid if we trust the server preference over local storage on first load
        // But for a controlled component, we might just want to align them
        if (preferences.theme_dark && theme !== 'dark') {
            setTheme('dark')
        } else if (!preferences.theme_dark && theme !== 'light') {
            setTheme('light')
        }
    }, [])

    if (!mounted) return null

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-6 pt-4 border-t border-white/5">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <SettingsIcon size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">App Preferences</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-medium text-foreground text-sm">Notifications</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <PreferenceToggle
                                icon={<Bell size={14} />}
                                label="Push Notifications"
                                description="Bounty & chat alerts"
                                checked={preferences.push_notifications}
                                onChange={() => onPreferenceChange('push_notifications', !preferences.push_notifications)}
                            />
                            <PreferenceToggle
                                icon={<Mail size={14} />}
                                label="Email Updates"
                                description="Weekly reports & tips"
                                checked={preferences.email_updates}
                                onChange={() => onPreferenceChange('email_updates', !preferences.email_updates)}
                            />
                            <PreferenceToggle
                                icon={<ShieldCheck size={14} />}
                                label="Security Alerts"
                                description="Login & session info"
                                checked={preferences.security_alerts}
                                onChange={() => onPreferenceChange('security_alerts', !preferences.security_alerts)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PreferenceToggle({ icon, label, description, checked, onChange }: {
    icon: React.ReactNode,
    label: string,
    description: string,
    checked: boolean,
    onChange: () => void
}) {
    return (
        <div
            onClick={onChange}
            className="flex items-center justify-between p-3 rounded-xl bg-surface-light dark:bg-background-dark/40 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer group shadow-sm dark:shadow-none"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
        </div>
    )
}
