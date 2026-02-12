import { User, ShieldCheck } from "@/components/icons";
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

    // Determine the settings path based on role
    // Assuming the structure is /(role)/role/settings
    const rolePath = profile.role?.toLowerCase() || 'user';
    const settingsPath = `/${rolePath}/settings`;

    return (
        <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-background-dark/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    {profile.isVerified && (
                        <ShieldCheck size={18} className="text-primary" fill="currentColor" />
                    )}
                </div>
                <p className="text-[10px] text-gray-500">Welcome back, {profile.name} • {profile.email}</p>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative group hover:bg-white/5 transition-colors" asChild>
                    <Link href={settingsPath}>
                        <User size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                        {needsAttention && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        )}
                    </Link>
                </Button>
            </div>
        </header>
    );
}
