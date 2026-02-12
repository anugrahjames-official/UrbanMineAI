"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Zap, Info, Mic, Send, Paperclip, MoreVertical, Box, User } from "@/components/icons";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  sender: string;
  time: string;
  text: string;
  image?: string;
  price?: string;
  priceRange?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "1",
      role: "user",
      sender: "Hub Logistics Manager",
      time: "10:23 AM",
      text: "Hello team. We have collected approximately 500kg of mixed motherboard scrap from the tech park. Most of it is desktop motherboards, some server boards included.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9LsPOqiRv0H6pmUfr-5l1_hNVipwtWdHqZmBdDs6T5xc02u9O5UR11WawAD3eWiUxTGaXTEcUsJk4jIvVAKvvei7Qzsv7cL65beCHDX48OBV_wYGi4FTNf39jKpPZ_iOfBGX5LUqOMjaMail6K6AO1ajQ1Tx9HSSeEFvxBaZVNkEESHMvsNlA5Hy4iEQ9Wxew_ZOgZg80EVMuw9BjXZ6UE5VK11X1Cpui_k9gglrFh7PvW_rLXD6tk0GjVvAYKlIJr_jww7iqtqe",
      price: "$10.50/kg"
    },
    {
      id: "2",
      role: "assistant",
      sender: "UrbanMine AI Broker",
      time: "10:24 AM",
      text: "Based on the image grading, the quality is mixed (Grade B). The visible capacitors suggest older models.",
      priceRange: "$9.20 - $9.80/kg"
    }
  ]);

  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || isStreaming) return;
    setDraft("");

    const userMsg: UiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      sender: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };

    const assistantId = crypto.randomUUID();
    const assistantMsg: UiMessage = {
      id: assistantId,
      role: "assistant",
      sender: "UrbanMine AI Broker",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
          context: {
            itemSummary: "Mixed motherboard scrap, ~500kg (Grade B)",
            liveRates: { copper_inr_per_kg: 720 },
          },
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const next = acc;
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: next } : m)));
      }
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Failed to contact broker agent.";
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: errText } : m)));
    } finally {
      setIsStreaming(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-4 md:-m-8">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDJtyzXWAHAJu5DVVIGxD0D3n2mmVh_NyGtfJ5klQ6wUbRmfZIEblx6WDmHi3SkZ6JOtVbLgBnWSPsuiOu_lIjUX5HauomPSYK-GKKzrfaz3gZySqgNJ5-JBw-niXbF4JE1UZ5RIx7Jq0K6Ci_nXRxBTc2SAWzvIkctWza3QUoaVcQktKQbgMAjtoKDlkcHRNCL1fa13Z3KH7ep6G1pZo3Ni6jsBdozDTsTIQ2xM6XYFYCBy1JxWS0BFa_6Xjgq8PATI2GnsQnWrfJ" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              alt="Partner"
            />
            <div className="absolute -bottom-1 -right-1 bg-background-dark rounded-full p-0.5">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              Metro City E-Waste Hub 
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] text-gray-400 uppercase font-semibold tracking-wide">#4492</span>
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-primary font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary" /> Active Negotiation
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Trust Score: 92/100</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="h-8 text-[10px] hidden md:flex">
            <Box size={14} className="mr-1" /> Inventory
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-bold text-gray-500 border border-white/5 uppercase tracking-widest">Today, 10:23 AM</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4 max-w-2xl", msg.role === "assistant" ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === "assistant" ? "bg-primary/20 border border-primary/40 text-primary shadow-glow-primary" : "bg-white/5 border border-white/10 overflow-hidden"
            )}>
              {msg.role === "assistant" ? <Zap size={14} /> : <User size={14} className="text-gray-500" />}
            </div>
            <div className={cn("flex flex-col gap-1", msg.role === "assistant" ? "items-end text-right" : "items-start")}>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-xs font-bold", msg.role === "assistant" ? "text-primary" : "text-gray-300")}>{msg.sender}</span>
                <span className="text-[10px] text-gray-600">{msg.time}</span>
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-md border",
                msg.role === "assistant" 
                  ? "bg-primary/5 border-primary/20 text-gray-200 rounded-tr-none" 
                  : "bg-surface-dark border-white/5 text-gray-200 rounded-tl-none"
              )}>
                <p>{msg.text}</p>
                {msg.image && (
                  <div className="mt-3 relative group overflow-hidden rounded-xl border border-white/10 w-full max-w-[240px]">
                    <img src={msg.image} className="w-full h-32 object-cover" alt="Waste" />
                  </div>
                )}
                {msg.price && <p className="mt-2 font-bold text-white">Asking Price: <span className="text-primary">{msg.price}</span></p>}
                {msg.priceRange && (
                  <div className="mt-3 pt-3 border-t border-primary/10">
                    <p className="text-[10px] text-primary uppercase tracking-widest font-bold mb-1">AI Suggestion</p>
                    <p className="text-white font-bold">{msg.priceRange}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Proposed Offer Component (Generative UI) */}
        <div className="flex flex-row-reverse gap-4 w-full ml-auto justify-center my-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ProposedOfferCard price="$9.75" weight="500kg" total="$4,875.00" />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 bg-surface-darker border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="h-7 text-[9px] rounded-full px-3">Request Photos</Button>
              <Button variant="secondary" size="sm" className="h-7 text-[9px] rounded-full px-3">Schedule Pickup</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">AI Autopilot</span>
              <div className="w-8 h-4 bg-primary/20 rounded-full relative cursor-pointer border border-primary/30">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full shadow-sm" />
              </div>
            </div>
          </div>
          <div className="relative flex items-end gap-2 bg-background-dark border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 transition-all shadow-xl">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-primary">
              <Paperclip size={20} />
            </Button>
            <textarea 
              className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 resize-none py-2.5 max-h-32 text-sm leading-relaxed"
              placeholder="Type your message or let AI draft a response..."
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-white">
                <Mic size={20} />
              </Button>
              <Button className="h-10 w-10 p-0 rounded-xl shadow-glow-primary" onClick={sendMessage} disabled={isStreaming}>
                <Send size={18} className="text-background-dark" />
              </Button>
            </div>
          </div>
          <p className="text-center text-[9px] text-gray-600">
            AI can make mistakes. Please verify financial details before accepting.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProposedOfferCard({ price, weight, total }: { price: string, weight: string, total: string }) {
  return (
    <div className="relative w-full max-w-sm group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-600 rounded-2xl opacity-20 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
      <GlassCard className="relative p-0 overflow-hidden border-primary/30 shadow-2xl bg-surface-darker">
        <div className="bg-primary/10 border-b border-primary/20 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <GavelIcon size={14} /> Proposed Offer
          </div>
          <StatusBadge variant="primary" className="text-[8px] bg-primary/20">Official Bid</StatusBadge>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Price per Kg</p>
              <p className="text-4xl font-bold text-white">{price}<span className="text-lg text-gray-500 font-normal ml-1">/kg</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Total Est.</p>
              <p className="text-2xl font-bold text-success">{total}</p>
              <p className="text-[10px] text-gray-500 font-medium">for {weight} net</p>
            </div>
          </div>
          
          <div className="bg-background-dark/50 rounded-xl p-3 border border-white/5 flex gap-3 items-start">
            <Info size={14} className="text-warning mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Condition: Subject to physical verification upon delivery. <br />
              Payment Terms: Instant via Stripe/UPI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-11 text-xs font-bold border-white/10">Counter</Button>
            <Button className="h-11 text-xs font-bold shadow-glow-primary">Accept Deal</Button>
          </div>
        </div>
        <div className="bg-background-dark p-2 text-center border-t border-white/5">
          <p className="text-[8px] text-gray-600 flex items-center justify-center gap-1 font-medium">
            <Zap size={8} className="text-primary" /> Generated by UrbanMine AI Broker
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

function GavelIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 12.5-8 8a2.11 2.11 0 1 1-3-3l8-8"/><path d="m16 16 2 2"/><path d="m19 13 2 2"/><path d="m5 5 3 3"/><path d="m2 2 2 2"/><path d="m22 22-2-2"/><path d="m8 2 2 2"/><path d="m16 4 1 1"/><path d="m13 1 1 1"/><path d="m4.5 15.5 2 2"/><path d="m13 5.4 1.4 1.4"/><path d="M15 2h1"/><path d="M22 9v1"/><path d="M10 22h1"/><path d="M2 15v1"/></svg>;
}
