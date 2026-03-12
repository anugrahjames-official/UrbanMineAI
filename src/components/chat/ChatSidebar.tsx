
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Recycle, Search, MoreVertical, MessageSquare, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

async function getNegotiations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { active: [], closed: [] };

    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
        id, 
        updated_at, 
        status,
        price_total,
        supplier_id,
        buyer_id,
        items (
            metadata
        )
    `)
        .or(`supplier_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

    if (!transactions) return { active: [], closed: [] };

    const active = transactions.filter(t => ['negotiating', 'pending'].includes(t.status));
    const closed = transactions.filter(t => ['agreed', 'paid', 'completed', 'cancelled'].includes(t.status));

    return { active, closed };
}

export async function ChatSidebar() {
    const { active, closed } = await getNegotiations();

    return (
        <aside className="w-80 h-full bg-white dark:bg-surface-darker border-r border-gray-200 dark:border-white/5 flex flex-col z-20 shadow-xl hidden md:flex">
            <div className="p-6 pb-2">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Chats</h2>
            </div>

            <div className="px-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                        className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-primary text-gray-300 placeholder-gray-500"
                        placeholder="Search negotiations..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-primary uppercase tracking-wider mb-2">Active Negotiations</h3>
                    <ul className="space-y-1">
                        {active.length === 0 && (
                            <p className="px-4 text-xs text-gray-500 italic">No active negotiations.</p>
                        )}
                        {active.map(t => {
                            const itemMeta = t.items?.[0]?.metadata as any || {};
                            return (
                                <li key={t.id}>
                                    <Link
                                        href={`/dealer/chat/${t.id}`}
                                        className="block p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30">
                                                        AI
                                                    </div>
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-surface-darker rounded-full"></span>
                                                </div>
                                                <span className="font-medium text-sm text-gray-200 group-hover:text-primary transition-colors">
                                                    {itemMeta.category || 'Unknown Item'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(t.updated_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-1 pl-10">
                                            Status: {t.status} • Offer: ${t.price_total}
                                        </p>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <div>
                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Closed Deals</h3>
                    <ul className="space-y-1 opacity-70">
                        {closed.map(t => {
                            const itemMeta = t.items?.[0]?.metadata as any || {};
                            return (
                                <li key={t.id}>
                                    <Link
                                        href={`/dealer/chat/${t.id}`}
                                        className="block p-3 rounded-lg hover:bg-white/5 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 text-xs font-bold border border-white/5">
                                                    AI
                                                </div>
                                                <span className="font-medium text-sm text-gray-400">
                                                    {itemMeta.category || 'Unknown Item'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-600">
                                                {new Date(t.updated_at || "").toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-1 pl-10">
                                            Closed at ${t.price_total}
                                        </p>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </aside>
    );
}
