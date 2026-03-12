import { User, CheckCircle } from "@/components/icons";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type UserProfile } from "@/app/actions/user";

interface DashboardHeaderProps {
    title: string;
    profile: UserProfile;
}

export function DashboardHeader({ title, profile }: DashboardHeaderProps) {
    // Logic for red notification dot
    const needsAttention = !profile.isVerified || !profile.business_name || !profile.location;

    const rolePath = profile.role?.toLowerCase() || 'user';

    return (
        <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-background-dark/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    {profile.isVerified && (
                        <CheckCircle size={18} className="text-primary" fill="currentColor" />
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <p className="text-[10px] text-gray-500">Welcome back, {profile.name}</p>
                    {profile.isVerified && <CheckCircle size={12} className="text-primary" fill="currentColor" />}
                    <p className="text-[10px] text-gray-500">• {profile.email}</p>
                </div>
            </div>
        </header>
    );
}
