"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Zap, Send, Mic, Paperclip, MoreVertical, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealCard } from "./DealCard";
import { toast } from "sonner";
import Link from "next/link";

interface ChatInterfaceProps {
    transaction: any;
    initialMessages: any[];
    userProfile: any;
}

export function ChatInterface({ transaction, initialMessages, userProfile }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/broker",
            body: { transactionId: transaction.id },
        }),
        messages: initialMessages,
        onError: (error) => {
            toast.error("Failed to send message: " + error.message);
        },
    });
    const isLoading = status === 'streaming' || status === 'submitted';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const text = input;
        setInput("");
        await sendMessage({ text });
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Extract Item Metadata
    const item = transaction.items?.[0] || {};
    const itemMeta = item.metadata || {};
    const itemImage = item.image_url;

    return (
        <div className="flex flex-col h-full bg-background-dark">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                            AI
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-background-dark rounded-full p-0.5">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow-primary" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                            {itemMeta.category || 'Unknown Item'}
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] text-gray-400 uppercase font-semibold tracking-wide">
                                #{transaction.id.slice(0, 4)}
                            </span>
                        </h2>
                        <div className="flex items-center gap-3 text-[10px]">
                            <span className="text-primary font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {transaction.status === 'negotiating' ? 'Active Negotiation' : transaction.status}
                            </span>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-400">Offer: <span className="text-white font-bold">${transaction.price_total}</span></span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/${userProfile.role}/inventory`}>
                        <Button variant="secondary" size="sm" className="h-8 text-[10px] hidden md:flex">
                            <Box size={14} className="mr-1" /> Inventory
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                        <MoreVertical size={16} />
                    </Button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-bold text-gray-500 border border-white/5 uppercase tracking-widest">
                        Started {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                </div>

                {/* Initial Item Context Bubble */}
                <div className="flex gap-4 max-w-2xl">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                        <User size={14} className="text-gray-500" />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-gray-300">System</span>
                            <span className="text-[10px] text-gray-600">Auto</span>
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-surface-dark border border-white/5 shadow-sm text-gray-200 text-sm leading-relaxed">
                            <p>New item scanned for negotiation.</p>
                            {itemImage && (
                                <div className="mt-3 relative group overflow-hidden rounded-xl border border-white/10 w-full max-w-[240px]">
                                    <img src={itemImage} className="w-full h-32 object-cover" alt="Item" />
                                </div>
                            )}
                            <p className="mt-2 font-medium text-gray-400 text-xs">
                                Estimated Weight: <span className="text-white">{itemMeta.weight}</span><br />
                                Category: <span className="text-white">{itemMeta.category}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {messages.map((m) => (
                    <div key={m.id} className={cn("flex gap-4 max-w-2xl", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                            m.role === "assistant" ? "bg-primary/20 border border-primary/40 text-primary shadow-glow-primary" : "bg-white/5 border border-white/10 overflow-hidden"
                        )}>
                            {m.role === "assistant" ? <Zap size={14} /> : <User size={14} className="text-gray-500" />}
                        </div>

                        <div className={cn("flex flex-col gap-1", m.role === "user" ? "items-end text-right" : "items-start")}>
                            <div className="flex items-baseline gap-2">
                                <span className={cn("text-xs font-bold", m.role === "assistant" ? "text-primary" : "text-gray-300")}>
                                    {m.role === "assistant" ? "UrbanMine AI" : "You"}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    {m.metadata && (m.metadata as any).createdAt ? new Date((m.metadata as any).createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-md border whitespace-pre-wrap",
                                m.role === "assistant"
                                    ? "bg-primary/5 border-primary/20 text-gray-200 rounded-tr-none"
                                    : "bg-surface-dark border-white/5 text-gray-200 rounded-tl-none"
                            )}>
                                {m.parts
                                    .filter((p) => p.type === 'text')
                                    .map((p, i) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Deal Card for Active Negotiations */}
                {transaction.status === 'negotiating' && (
                    <div className="flex flex-row-reverse gap-4 w-full ml-auto justify-center my-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <DealCard
                            price={transaction.price_total / (parseFloat(itemMeta.weight) || 1)} // Approx unit price
                            weight={itemMeta.weight || 'N/A'}
                            total={transaction.price_total}
                            onAccept={() => toast.info("Please explicitly type 'I accept' to confirm.")}
                            onCounter={() => document.querySelector('textarea')?.focus()}
                        />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-surface-darker border-t border-white/5">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" className="h-7 text-[9px] rounded-full px-3">Request Photos</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">AI Autopilot</span>
                            <div className="w-8 h-4 bg-primary/20 rounded-full relative cursor-pointer border border-primary/30">
                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-background-dark border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 transition-all shadow-xl">
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-primary">
                            <Paperclip size={20} />
                        </Button>

                        <textarea
                            className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 focus:outline-none resize-none py-2.5 max-h-32 text-sm leading-relaxed"
                            placeholder="Type your message or let AI draft a response..."
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                        />

                        <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-white">
                                <Mic size={20} />
                            </Button>
                            <Button type="submit" disabled={isLoading || !input.trim()} className="h-10 w-10 p-0 rounded-xl shadow-glow-primary bg-primary hover:bg-primary/90 text-background-dark">
                                <Send size={18} />
                            </Button>
                        </div>
                    </form>
                    <p className="text-center text-[9px] text-gray-600">
                        AI can make mistakes. Please verify financial details before accepting.
                    </p>
                </div>
            </div>
        </div>
    );
}
