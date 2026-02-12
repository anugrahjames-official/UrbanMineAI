"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Cpu,
  Scan,
  PlayCircle,
  Focus,
  AlertTriangle,
  TrendingDown,
  BatteryWarning,
  Eye,
  Handshake,
  ShieldCheck,
  FileText,
  Banknote,
  Store,
  Shield,
  Mail,
  MapPin,
  ArrowRight,
  Recycle,
  Factory,
  TrendingUp,
  Award,
  Globe
} from "lucide-react";

type StakeholderTab = "dealers" | "recyclers" | "oems";

export default function Home() {
  const [activeTab, setActiveTab] = useState<StakeholderTab>("dealers");
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-primary selection:text-background-dark min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background-dark font-bold">
                <Cpu size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">UrbanMine<span className="text-primary">AI</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-primary transition-colors" href="#">Platform</Link>
              <Link className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-primary transition-colors" href="#">Marketplace</Link>
              <Link className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-primary transition-colors" href="#">Impact</Link>
              <Link className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-primary transition-colors" href="#">Partners</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block" href="/login">Log in</Link>
              <Link className="px-5 py-2.5 text-sm font-semibold rounded-full border border-primary text-primary hover:bg-primary hover:text-background-dark transition-all duration-300" href="/register">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#19e66b05_1px,transparent_1px),linear-gradient(to_bottom,#19e66b05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* AR HUD Overlays */}
        <div className="absolute top-32 left-10 w-64 h-64 border-l border-t border-primary/20 opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 border-r border-b border-primary/20 opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              System Online: Global Formalization
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1]">
              Unlocking the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 glow-text">Critical Minerals</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Agentic AI-driven E-Waste recovery formalizing the informal sector. Turn waste into wealth with precision computer vision and automated brokerage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dealer/scan" className="group relative px-8 py-4 bg-primary text-background-dark font-bold text-lg rounded-full overflow-hidden transition-all duration-300 primary-glow flex items-center justify-center gap-3">
                <Scan className="group-hover:rotate-12 transition-transform" />
                Scan & Value Now
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              <button className="px-8 py-4 border border-slate-600 hover:border-primary text-foreground font-medium text-lg rounded-full transition-colors duration-300 flex items-center justify-center gap-2 group">
                <PlayCircle className="group-hover:text-primary transition-colors" />
                View Demo
              </button>
            </div>
          </div>

          {/* Hero Visual (3D/AR Concept) */}
          <div className="relative lg:h-[600px] w-full flex items-center justify-center">
            {/* Abstract AR Card */}
            <div className="relative w-full aspect-square max-w-md">
              {/* Background Image for 3D render */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden glass-panel border border-primary/20 shadow-2xl">
                {/* Hero Image Component */}
                <Image
                  src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=1200"
                  alt="CPU X99 Processor"
                  fill
                  className="object-cover opacity-60 mix-blend-screen"
                />

                {/* AR Overlay UI */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="font-mono text-xs text-primary/80 border border-primary/30 p-2 bg-black/40 rounded">
                      ID: CPU-X99<br />
                      GRADE: A+
                    </div>
                    <Focus className="text-primary animate-pulse" />
                  </div>

                  {/* Bounding Box Central */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/50 rounded-lg flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary"></div>

                    <div className="bg-primary/20 backdrop-blur-sm px-3 py-1 rounded text-white text-sm font-bold">
                      Au: 0.2g | Cu: 14g
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4"></div>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>RECOVERY PROBABILITY</span>
                      <span className="text-primary">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Stats Section */}
      <section className="py-20 bg-background-dark relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="group p-8 rounded-2xl glass-panel hover:bg-surface-dark transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle size={96} className="text-primary" />
              </div>
              <div className="relative z-10">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 font-display">1.75M</div>
                <div className="text-primary font-mono text-sm uppercase tracking-wider mb-4">Tonnes Generated</div>
                <p className="text-slate-400 text-sm">Annual e-waste generation continues to surge, creating massive environmental pressure.</p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="group p-8 rounded-2xl glass-panel hover:bg-surface-dark transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown size={96} className="text-primary" />
              </div>
              <div className="relative z-10">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 font-display">90%</div>
                <div className="text-primary font-mono text-sm uppercase tracking-wider mb-4">Informal Leakage</div>
                <p className="text-slate-400 text-sm">Most valuable materials are lost to informal sectors with low recovery rates.</p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="group p-8 rounded-2xl glass-panel hover:bg-surface-dark transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BatteryWarning size={96} className="text-primary" />
              </div>
              <div className="relative z-10">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 font-display">CRITICAL</div>
                <div className="text-primary font-mono text-sm uppercase tracking-wider mb-4">REE Deficit</div>
                <p className="text-slate-400 text-sm">Supply chains face severe shortages of Rare Earth Elements needed for tech.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agentic Workflow Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-primary font-mono text-sm uppercase tracking-widest">Process Architecture</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">The Agentic Workflow</h2>
          </div>

          <div className="relative">
            {/* Vertical Neon Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-800 -translate-x-1/2 hidden md:block">
              <div className="w-full h-1/2 bg-gradient-to-b from-primary via-primary to-transparent opacity-50"></div>
            </div>

            <div className="space-y-24">
              {/* Step 1: The Sorter */}
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">01. The Sorter</h3>
                  <h4 className="text-primary font-mono text-sm mb-4">COMPUTER VISION NODE</h4>
                  <p className="text-slate-400">Advanced ML models identify component grades instantly via mobile scanning. Detects gold, palladium, and copper content with 98% accuracy.</p>
                </div>
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-background-dark border border-primary shadow-[0_0_30px_rgba(25,230,107,0.3)] flex items-center justify-center order-1 md:order-2 shrink-0">
                  <Eye className="text-primary" size={40} />
                </div>
                <div className="flex-1 order-3">
                  <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="flex items-center gap-4 text-slate-300 font-mono text-xs">
                      <span className="block w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Scanning...</span>
                      <span className="ml-auto opacity-50">CV-MODEL-V4.2</span>
                    </div>
                    <div className="mt-4 h-24 bg-slate-900/50 rounded border border-white/5 relative overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=2070&auto=format&fit=crop"
                        alt="High-precision CPU scanning"
                        fill
                        className="object-cover opacity-50"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-30"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-primary shadow-[0_0_10px_#19e66b]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: The Broker */}
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 order-3 md:order-1">
                  <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span>OFFER: #8821</span>
                        <span className="text-primary">MATCHED</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-primary/20">
                        <span className="text-white text-sm">Recycler X</span>
                        <span className="text-primary font-bold">$450.00</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-900/30 p-3 rounded border border-white/5 opacity-60">
                        <span className="text-white text-sm">Scrap Dealer Y</span>
                        <span className="text-slate-400">$410.00</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-background-dark border border-primary shadow-[0_0_30px_rgba(25,230,107,0.3)] flex items-center justify-center order-1 md:order-2 shrink-0">
                  <Handshake className="text-primary" size={40} />
                </div>
                <div className="flex-1 text-center md:text-left order-2 md:order-3">
                  <h3 className="text-2xl font-bold text-foreground mb-2">02. The Broker</h3>
                  <h4 className="text-primary font-mono text-sm mb-4">AUTONOMOUS NEGOTIATION</h4>
                  <p className="text-slate-400">Connects informal collectors with certified recyclers. Our AI negotiates fair market pricing in real-time based on LME spot prices.</p>
                </div>
              </div>

              {/* Step 3: The Compliance Officer */}
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">03. The Compliance Officer</h3>
                  <h4 className="text-primary font-mono text-sm mb-4">AUTOMATED ESG AUDIT</h4>
                  <p className="text-slate-400">Generates immutable chain-of-custody documentation. Ensures every transaction meets Basel Convention and local e-waste regulations.</p>
                </div>
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-background-dark border border-primary shadow-[0_0_30px_rgba(25,230,107,0.3)] flex items-center justify-center order-1 md:order-2 shrink-0">
                  <ShieldCheck className="text-primary" size={40} />
                </div>
                <div className="flex-1 order-3">
                  <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary" size={20} />
                        <span className="text-white font-medium">Manifest_A29.pdf</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-full"></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>VERIFICATION COMPLETE</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Interface */}
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
            {/* Decorative background blob */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Scrap Dealers Content */}
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
                    src="/scrap-dealer.jpg"
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

            {/* Recyclers Content */}
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
                    src="/recycling-facility.jpg"
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

            {/* OEMs Content */}
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
                    src="/electronics-manufacturing.jpg"
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

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="text-primary" size={24} />
                <span className="text-xl font-bold text-white">UrbanMine<span className="text-primary">AI</span></span>
              </div>
              <p className="text-slate-400 text-sm mb-6">Formalizing the future of circular critical minerals through Agentic AI.</p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-background-dark transition-colors" href="#">
                  <span className="font-bold text-sm">Li</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-background-dark transition-colors" href="#">
                  <span className="font-bold text-sm">X</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-background-dark transition-colors" href="#">
                  <span className="font-bold text-sm">Ig</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link className="hover:text-primary transition-colors" href="#">The Sorter</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Marketplace</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Compliance Cloud</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">API Access</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Fellowships</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link className="hover:text-primary transition-colors" href="#">Sustainability Grants</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Academic Research</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Hardware Accelerator</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Global Impact Fund</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="text-primary" size={16} />
                  hello@urbanmine.ai
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="text-primary" size={16} />
                  India
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm">
              © 2026 UrbanMineAI Inc. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link className="hover:text-white transition-colors" href="#">Privacy Policy</Link>
              <Link className="hover:text-white transition-colors" href="#">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}