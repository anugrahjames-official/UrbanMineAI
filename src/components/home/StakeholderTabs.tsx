"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Banknote,
    Store,
    Shield,
    ArrowRight,
    TrendingUp,
    Award,
    Recycle,
    Globe,
    ShieldCheck,
    Factory
} from "lucide-react";

type StakeholderTab = "dealers" | "recyclers" | "oems";

export default function StakeholderTabs() {
    const [activeTab, setActiveTab] = useState<StakeholderTab>("dealers");

    return (
        <section className="py-24 bg-background-dark/50 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground">Ecosystem Integration</h2>
                    <p className="text-slate-400 mt-4">Tailored solutions for every node in the circular economy.</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab("dealers")}
                        className={`px-8 py-3 rounded-full font-bold transition shadow-lg ${activeTab === "dealers"
                            ? "bg-primary text-background-dark shadow-[0_0_15px_rgba(25,230,107,0.4)]"
                            : "border border-white/10 text-slate-300 font-medium hover:border-primary/50 hover:text-white bg-white/5"
                            }`}
                    >
                        Scrap Dealers
                    </button>
                    <button
                        onClick={() => setActiveTab("recyclers")}
                        className={`px-8 py-3 rounded-full font-bold transition shadow-lg ${activeTab === "recyclers"
                            ? "bg-primary text-background-dark shadow-[0_0_15px_rgba(25,230,107,0.4)]"
                            : "border border-white/10 text-slate-300 font-medium hover:border-primary/50 hover:text-white bg-white/5"
                            }`}
                    >
                        Recyclers
                    </button>
                    <button
                        onClick={() => setActiveTab("oems")}
                        className={`px-8 py-3 rounded-full font-bold transition shadow-lg ${activeTab === "oems"
                            ? "bg-primary text-background-dark shadow-[0_0_15px_rgba(25,230,107,0.4)]"
                            : "border border-white/10 text-slate-300 font-medium hover:border-primary/50 hover:text-white bg-white/5"
                            }`}
                    >
                        OEMs
                    </button>
                </div>

                {/* Active Tab Content */}
                <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                    {activeTab === "dealers" && (
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Empower the Informal Sector</h3>
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Banknote className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Fair Pricing Models</h4>
                                            <p className="text-slate-400 text-sm mt-1">Instant valuation based on real metal content, not just weight.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Store className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Digital Storefront</h4>
                                            <p className="text-slate-400 text-sm mt-1">Showcase inventory to global buyers without intermediaries.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Shield className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Safe Payments</h4>
                                            <p className="text-slate-400 text-sm mt-1">Secure escrow services ensuring you get paid upon delivery.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link className="text-primary font-semibold hover:text-emerald-300 inline-flex items-center gap-2" href="#">
                                        Learn about dealer benefits <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative h-80 rounded-xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="https://images.unsplash.com/photo-1532187863486-abfcd0ad4099?auto=format&fit=crop&q=80&w=800"
                                    alt="Professional Scrap Dealer"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-primary/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono text-slate-300">RECENT TRANSACTION</span>
                                            <span className="text-xs font-bold text-primary">COMPLETED</span>
                                        </div>
                                        <div className="text-white font-bold text-lg">Batch #3928: Motherboards</div>
                                        <div className="text-slate-300 text-sm mt-1">+12% Value vs Local Market</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "recyclers" && (
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Scale Your Recovery Operations</h3>
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <TrendingUp className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Predictable Feedstock</h4>
                                            <p className="text-slate-400 text-sm mt-1">Access verified, pre-graded materials with guaranteed composition data.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Award className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Certification & Compliance</h4>
                                            <p className="text-slate-400 text-sm mt-1">Automated ESG reporting and Basel Convention documentation.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Recycle className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Optimized Recovery Rates</h4>
                                            <p className="text-slate-400 text-sm mt-1">AI-driven sorting recommendations to maximize precious metal yield.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link className="text-primary font-semibold hover:text-emerald-300 inline-flex items-center gap-2" href="#">
                                        Explore recycler solutions <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative h-80 rounded-xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800"
                                    alt="Modern Recycling Facility"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-primary/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono text-slate-300">MONTHLY THROUGHPUT</span>
                                            <span className="text-xs font-bold text-primary">OPTIMIZED</span>
                                        </div>
                                        <div className="text-white font-bold text-lg">2,450 kg Processed</div>
                                        <div className="text-slate-300 text-sm mt-1">98.2% Recovery Efficiency</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "oems" && (
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Secure Your Supply Chain</h3>
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Globe className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Urban Mining Access</h4>
                                            <p className="text-slate-400 text-sm mt-1">Source critical minerals from verified urban mining networks globally.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <ShieldCheck className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Traceability & ESG</h4>
                                            <p className="text-slate-400 text-sm mt-1">Complete chain-of-custody tracking for sustainability reporting.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                            <Factory className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Circular Economy Integration</h4>
                                            <p className="text-slate-400 text-sm mt-1">Close the loop with take-back programs and secondary material sourcing.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link className="text-primary font-semibold hover:text-emerald-300 inline-flex items-center gap-2" href="#">
                                        Discover OEM partnerships <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative h-80 rounded-xl overflow-hidden border border-white/10 group">
                                <Image
                                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                                    alt="Electronics Manufacturing"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-primary/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono text-slate-300">SUPPLY CHAIN STATUS</span>
                                            <span className="text-xs font-bold text-primary">SECURED</span>
                                        </div>
                                        <div className="text-white font-bold text-lg">Q1 2026: REE Sourcing</div>
                                        <div className="text-slate-300 text-sm mt-1">45% from Urban Mining</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
