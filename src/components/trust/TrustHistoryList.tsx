'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTrustHistory, submitAppeal } from '@/app/actions/trust'
import { formatDistanceToNow } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is used, or use generic toast

interface HistoryItem {
    id: string;
    amount: number;
    reason: string;
    created_at: string;
    is_appealable: boolean;
}

export function TrustHistoryList({ userId }: { userId: string }) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTrustHistory(userId).then(data => {
            setHistory(data)
            setLoading(false)
        })
    }, [userId])

    if (loading) return <div className="text-center p-4"><Loader2 className="animate-spin mx-auto" /></div>

    return (
        <Card className="glass-panel w-full">
            <CardHeader>
                <CardTitle className="text-lg text-primary-400">Trust History</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                    {history.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No history yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <HistoryItemRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

function HistoryItemRow({ item }: { item: HistoryItem }) {
    const isPositive = item.amount > 0

    return (
        <div className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Badge variant={isPositive ? 'default' : 'destructive'} className={isPositive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''}>
                        {isPositive ? '+' : ''}{item.amount}
                    </Badge>
                    <span className="text-sm font-medium">{item.reason}</span>
                </div>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.created_at))} ago</p>
            </div>

            {item.is_appealable && (
                <AppealDialog historyId={item.id} />
            )}
        </div>
    )
}

function AppealDialog({ historyId }: { historyId: string }) {
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async () => {
        if (!reason.trim()) return
        setSubmitting(true)
        try {
            const res = await submitAppeal(historyId, reason)
            if (res.success) {
                toast.success('Appeal submitted for review')
                setOpen(false)
            } else {
                toast.error(res.error || 'Failed to submit')
            }
        } catch (e) {
            toast.error('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-orange-400 hover:text-orange-300">
                    Appeal
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-primary/20">
                <DialogHeader>
                    <DialogTitle>Appeal Penalty</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="bg-orange-500/10 p-3 rounded-md flex gap-2 items-start">
                        <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-200">
                            Appeals are reviewed by admins. Frivolous appeals may result in further penalties.
                        </p>
                    </div>
                    <Textarea
                        placeholder="Explain why this penalty is incorrect..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-black/20 border-white/10"
                    />
                    <Button onClick={handleSubmit} disabled={submitting || !reason.trim()} className="w-full">
                        {submitting ? 'Submitting...' : 'Submit Appeal'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
