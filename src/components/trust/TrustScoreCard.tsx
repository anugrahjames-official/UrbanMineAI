'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Info, ShieldCheck, ShieldAlert, BadgeCheck } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface TrustScoreCardProps {
    score: number;
    tier: string;
    trustFlags?: string[];
}

export function TrustScoreCard({ score, tier, trustFlags = [] }: TrustScoreCardProps) {
    // Determine color and icon based on score
    let colorClass = 'text-primary'
    let progressClass = 'bg-primary'
    let Icon = ShieldCheck
    let nextTier = 'Verified'
    let pointsToNext = 50 - score
    let progress = (score / 50) * 100

    if (score >= 30 && score < 50) {
        colorClass = 'text-orange-400'
        progressClass = 'bg-orange-400'
        Icon = ShieldAlert
        nextTier = 'Verified (50)'
        pointsToNext = 50 - score
        progress = ((score - 30) / 20) * 100
    } else if (score >= 50 && score < 80) {
        colorClass = 'text-blue-400'
        progressClass = 'bg-blue-400'
        Icon = ShieldCheck
        nextTier = 'Trusted (80)'
        pointsToNext = 80 - score
        progress = ((score - 50) / 30) * 100
    } else if (score >= 80) {
        colorClass = 'text-green-400'
        progressClass = 'bg-green-400'
        Icon = BadgeCheck
        nextTier = 'Elite (100)'
        pointsToNext = 100 - score
        progress = ((score - 80) / 20) * 100
    }

    if (score >= 100) {
        pointsToNext = 0
        progress = 100
    }

    return (
        <Card className="glass-panel border-primary/20 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full", progressClass)} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium text-muted-foreground">Trust Score</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground/50 hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="glass-panel max-w-[200px]">
                                <p className="text-xs">
                                    Your reputation score. Higher scores unlock instant payouts and better deals.
                                    <br /><span className="italic text-primary-400 opacity-80 mt-1 block">Malayalam translation here...</span>
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-3 mb-4">
                    <div className={cn("text-4xl font-bold font-mono tracking-tighter", colorClass)}>
                        {score}
                    </div>
                    <div className="flex flex-col mb-1.5">
                        <span className="text-sm font-semibold text-foreground/90">{tier}</span>
                        {score < 100 && (
                            <span className="text-xs text-muted-foreground">
                                +{pointsToNext} to {nextTier}
                            </span>
                        )}
                    </div>
                    <Icon className={cn("w-8 h-8 ml-auto opacity-20", colorClass)} />
                </div>

                <Progress value={progress} className="h-2 bg-muted/20" indicatorClassName={progressClass} />

                {trustFlags.length > 0 && (
                    <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-xs text-red-300 font-medium flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3" />
                            Action Required:
                        </p>
                        <ul className="list-disc list-inside text-[10px] text-red-200/80 mt-1">
                            {trustFlags.map((flag, i) => (
                                <li key={i}>{flag.replace(/_/g, ' ')}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
