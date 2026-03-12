"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { UserProfile, signOut } from "@/app/actions/user";
import { LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
    user: any;
    profile?: UserProfile | null;
}

export default function UserDropdown({ user, profile }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userData = {
        name: profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url
    };

    const userRole = profile?.role || user?.user_metadata?.role;
    const dashboardLink = userRole ? `/${userRole}/dashboard` : '/dashboard';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-all duration-300"
            >
                <UserAvatar user={userData} className="w-9 h-9" />
                <ChevronDown size={16} className={cn("text-white/60 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <p className="text-sm font-bold text-white truncate">{userData.name}</p>
                        <p className="text-xs text-white/40 truncate">{userData.email}</p>
                    </div>

                    <div className="p-2">
                        <Link
                            href={dashboardLink}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                        >
                            <User size={18} />
                            Profile Settings
                        </Link>
                    </div>

                    <div className="p-2 border-t border-white/10">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-200"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
