"use client";

import { Recycle, LayoutDashboard, Gavel, Box, LocalShipping, BarChart3, Settings, HelpCircle, CheckCircle } from "@/components/icons";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { UserProfile } from "@/app/actions/user";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const recyclerNavItems = [
    { name: "Dashboard", href: "/recycler/dashboard", icon: LayoutDashboard },
    { name: "Procurement", href: "/recycler/procurement", icon: Gavel },
    { name: "Inventory", href: "/recycler/inventory", icon: Box },
    { name: "Logistics", href: "/recycler/logistics", icon: LocalShipping },
    { name: "Market Trends", href: "/recycler/trends", icon: BarChart3 },
];

export function RecyclerSidebar({ profile }: { profile: UserProfile }) {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex w-64 bg-surface-darker border-r border-white/5 flex-col justify-between transition-all duration-300">
            <div>
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Recycle className="text-primary" size={28} />
                        <h1 className="text-lg font-bold tracking-tight text-white">UrbanMine<span className="text-primary">AI</span></h1>
                    </div>
                </div>

                <nav className="mt-6 px-4 space-y-1">
                    {recyclerNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-2.5 rounded-lg transition-all group",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} className={cn("mr-3 transition-transform group-hover:scale-110", pathname === item.href && "text-primary")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</h3>
                        <Link
                            href="/recycler/settings"
                            className={cn(
                                "flex items-center px-3 py-2.5 rounded-lg transition-all group mb-1",
                                pathname === "/recycler/settings"
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Settings size={20} className={cn("mr-3 transition-transform group-hover:rotate-45", pathname === "/recycler/settings" && "text-primary")} />
                            <span className="font-medium">Settings</span>
                        </Link>
                        <Link
                            href="/recycler/support"
                            className={cn(
                                "flex items-center px-3 py-2.5 rounded-lg transition-all group",
                                pathname === "/recycler/support"
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <HelpCircle size={20} className={cn("mr-3 transition-transform group-hover:scale-110", pathname === "/recycler/support" && "text-primary")} />
                            <span className="font-medium">Support</span>
                        </Link>
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group">
                    <div className="relative">
                        <UserAvatar user={profile} className="w-10 h-10" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface-darker rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold truncate text-white">{profile.name}</p>
                            {profile.isVerified && <CheckCircle size={14} className="text-primary" fill="currentColor" />}
                        </div>
                        <p className="text-[10px] text-primary">Trust Score: {profile.trust_score}</p>
                    </div>
                    <Link href="/recycler/settings">
                        <Settings size={16} className="text-gray-500 group-hover:text-white" />
                    </Link>
                </div>
            </div>
        </aside>
    )
}

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-darker border-t border-white/5 pb-safe z-40">
            <div className="flex justify-around items-center h-16">
                {recyclerNavItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full transition-all",
                            pathname === item.href ? "text-primary" : "text-gray-500"
                        )}
                    >
                        <item.icon size={20} className={pathname === item.href ? "scale-110" : ""} />
                        <span className="text-[10px] mt-1">{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
