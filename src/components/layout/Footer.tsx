"use client";

import Link from "next/link";
import { Cpu, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
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
                            <li><Link className="hover:text-primary transition-colors" href="/marketplace">Marketplace</Link></li>
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
    );
}
