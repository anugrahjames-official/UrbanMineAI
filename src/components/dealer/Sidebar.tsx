"use client";

import { Recycle, LayoutDashboard, Camera, MessageSquare, Box, BarChart3, Settings, ShieldCheck } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const dealerNavItems = [
    { name: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    { name: "Scan", href: "/dealer/scan", icon: Camera },
    { name: "Chat", href: "/dealer/chat", icon: MessageSquare, badge: 2 },
    { name: "Inventory", href: "/dealer/inventory", icon: Box },
    { name: "Analytics", href: "/dealer/analytics", icon: BarChart3 },
];

export function DealerSidebar({ profile }: { profile: any }) {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex w-64 bg-surface-darker border-r border-white/5 flex-col justify-between transition-all duration-300">
            <div>
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow-primary">
                        <Recycle className="text-background-dark" size={24} strokeWidth={2.5} />
                    </div>
                    <div className="ml-3">
                        <h1 className="text-lg font-bold tracking-tight text-white">UrbanMineAI</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Dealer Hub</p>
                    </div>
                </div>

                <nav className="mt-8 px-4 space-y-2">
                    {dealerNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 rounded-xl transition-all group",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} className={cn("transition-transform group-hover:scale-110", pathname === item.href && "text-primary")} />
                            <span className="ml-3 font-medium">{item.name}</span>
                            {item.badge && (
                                <span className="ml-auto w-5 h-5 bg-primary text-background-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">System</h3>
                        <Link
                            href="/dealer/settings"
                            className={cn(
                                "flex items-center px-4 py-3 rounded-xl transition-all group mb-2",
                                pathname === "/dealer/settings"
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Settings size={20} className={cn("transition-transform group-hover:rotate-45", pathname === "/dealer/settings" && "text-primary")} />
                            <span className="ml-3 font-medium">Settings</span>
                        </Link>
                        <Link
                            href="/dealer/support"
                            className={cn(
                                "flex items-center px-4 py-3 rounded-xl transition-all group",
                                pathname === "/dealer/support"
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ShieldCheck size={20} className={cn("transition-transform group-hover:scale-110", pathname === "/dealer/support" && "text-primary")} />
                            <span className="ml-3 font-medium">Support</span>
                        </Link>
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group">
                    <div className="relative">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Fqyq5WpNTQOdnQRjcQOjnBIw8iOwnNS44BJj7OEThFPk4vD8KCbmE-sgJYJIvGzcRRjbpGAHnqw0kD1F6buW0FeyxGfscwsrsLoY-7JDOj1-84vuvH1RgAr8_h50Sy6F9fuK3BhKZfxGrymIHO3xKmwMq7_hUp0pqQlTfCSLmoOyFWhk7cL4SpsPFaCHgOz8zEnE57175ywNbSb5aWO42yes5Y_wgNPEYk4_vSWyyPTvZTN1g8DA7UGfhtJttVJGHuKl0mprcnX_"
                            className="w-10 h-10 rounded-full border-2 border-primary/50 object-cover"
                            alt="Profile"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface-darker rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold truncate text-white">{profile.name}</p>
                            {profile.isVerified && <ShieldCheck size={14} className="text-primary" fill="currentColor" />}
                        </div>
                        <p className="text-[10px] text-primary">Trust: {profile.trust_score}</p>
                    </div>
                    <Link href="/dealer/settings">
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-darker border-t border-white/5 pb-safe z-40">
            <div className="flex justify-around items-center h-16">
                {dealerNavItems.map((item) => (
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
