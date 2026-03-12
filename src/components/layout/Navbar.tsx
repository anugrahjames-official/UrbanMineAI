"use client";

import Link from "next/link";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import UserDropdown from "./UserDropdown";
import { UserProfile } from "@/app/actions/user";

interface NavbarProps {
    user?: any;
    profile?: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
    const pathname = usePathname();
    const isMarketplace = pathname === '/marketplace';

    return (
        <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 glass-panel">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background-dark font-bold">
                            <Cpu size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            UrbanMine<span className="text-primary">AI</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === '#' ? "text-primary" : "text-slate-500 dark:text-slate-300 hover:text-primary"
                            )}
                            href="#"
                        >
                            Platform
                        </Link>
                        <Link
                            className={cn(
                                "text-sm font-medium transition-colors",
                                isMarketplace ? "text-primary font-bold" : "text-slate-500 dark:text-slate-300 hover:text-primary"
                            )}
                            href="/marketplace"
                        >
                            Marketplace
                        </Link>
                        <Link
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === '#impact' ? "text-primary" : "text-slate-500 dark:text-slate-300 hover:text-primary"
                            )}
                            href="#"
                        >
                            Impact
                        </Link>
                        <Link
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === '#partners' ? "text-primary" : "text-slate-500 dark:text-slate-300 hover:text-primary"
                            )}
                            href="#"
                        >
                            Partners
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link
                                    className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block"
                                    href="/login"
                                >
                                    Log in
                                </Link>
                                <Link
                                    className="px-5 py-2.5 text-sm font-semibold rounded-full border border-primary text-primary hover:bg-primary hover:text-background-dark transition-all duration-300"
                                    href="/register"
                                >
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <UserDropdown user={user} profile={profile} />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
