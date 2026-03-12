'use client';

import { Progress } from "@/components/ui/progress";
import React from 'react';
import { BarChart3, FlaskConical } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MaterialYield {
    element: string;
    symbol: string;
    estimate: string;
    unit: string;
    percentage: number;
    value: string;
    color: string;
    status?: string;
}

interface YieldAnalysisProps {
    yields?: MaterialYield[];
    confidence?: number;
}

export default function YieldAnalysis({ yields, confidence = 98 }: YieldAnalysisProps) {
    // Default yields if none provided (matching the design mock)
    const defaultYields: MaterialYield[] = [
        {
            element: "Gold Estimate",
            symbol: "Au",
            estimate: "14g",
            unit: "/ton",
            percentage: 85,
            value: "$4,200 USD",
            color: "text-[#FFD700] bg-[#FFD700]",
            status: "High Yield"
        },
        {
            element: "Palladium Est.",
            symbol: "Pd",
            estimate: "4g",
            unit: "/ton",
            percentage: 62,
            value: "$980 USD",
            color: "text-[#CED0CE] bg-[#CED0CE]",
            status: "Moderate"
        }
    ];

    const displayYields = yields || defaultYields;

    return (
        <div className="space-y-4">

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="text-[#19e66b]" size={20} />
                    Material Yield Analysis
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayYields.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#102218]/50 p-4 rounded-xl border border-white/5 hover:border-[#19e66b]/30 transition-colors group"
                    >

                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                    item.color.split(' ')[1].replace('bg-', 'bg-opacity-20 ') // HACK to add opacity to bg color
                                )}>
                                    {item.symbol}
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">{item.element}</p>
                                    <p className="text-lg font-bold text-white">
                                        {item.estimate}<span className="text-sm font-normal text-white/50">{item.unit}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                            <div
                                className={cn("h-1.5 rounded-full", item.color.split(' ')[1])}
                                style={{ width: `${item.percentage}%`, boxShadow: `0 0 10px ${item.color.split(' ')[1].replace('bg-', '')}` }}
                            ></div>
                        </div>
                        <p className="text-xs text-white/40 mt-2 group-hover:text-[#19e66b] transition-colors">
                            Est. Value: {item.value}
                        </p>
                    </div>
                ))}
            </div>


        </div>
    );
}
