"use client";

import { Recycle, ShieldCheck, FileText, History, Settings, HelpCircle } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const oemNavItems = [
    { name: "Compliance", href: "/oem/compliance", icon: ShieldCheck },
    { name: "Document Vault", href: "/oem/docs", icon: FileText },
    { name: "Audit Logs", href: "/oem/audit", icon: History },
];

export function OEMSidebar({ profile }: { profile: any }) {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex w-64 bg-surface-dark border-r border-white/5 flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                    <Recycle className="text-background-dark" size={20} strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">UrbanMine<span className="text-primary">AI</span></h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
                <Link
                    href="/oem/compliance"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                        pathname === "/oem/compliance"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <ShieldCheck size={20} />
                    <span className="font-medium">Compliance</span>
                </Link>
                {oemNavItems.slice(1).map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            pathname === item.href
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-white/5">
                    <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">System</h3>
                    <Link
                        href="/oem/settings"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            pathname === "/oem/settings"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                    <Link
                        href="/oem/support"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                            pathname === "/oem/support"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <HelpCircle size={20} />
                        <span className="font-medium">Support</span>
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/50">
                            {profile.first_name?.[0] || profile.email[0].toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface-dark rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold truncate text-white">{profile.name}</p>
                            {profile.isVerified && <ShieldCheck size={14} className="text-primary" fill="currentColor" />}
                        </div>
                        <p className="text-[10px] text-primary">Trust Score: {profile.trust_score}</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
