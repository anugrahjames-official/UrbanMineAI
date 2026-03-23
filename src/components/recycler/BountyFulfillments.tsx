'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"
import { getBountyFulfillments, acceptBountyFulfillment } from "@/app/actions/bounty"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BountyFulfillmentsProps {
    bountyId: string
    fulfillmentCount: number
    onAcceptSuccess?: () => void
}

export function BountyFulfillments({ bountyId, fulfillmentCount, onAcceptSuccess }: BountyFulfillmentsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [fulfillments, setFulfillments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAccepting, setIsAccepting] = useState<string | null>(null)

    const handleOpen = async () => {
        setIsOpen(true)
        setIsLoading(true)
        const result = await getBountyFulfillments(bountyId)
        if (result.data) {
            setFulfillments(result.data)
        } else {
            toast.error("Failed to load offers")
        }
        setIsLoading(false)
    }

    const handleAccept = async (id: string) => {
        setIsAccepting(id)
        const result = await acceptBountyFulfillment(id)
        if (result.success) {
            toast.success("Offer accepted successfully!")
            setIsOpen(false)
            onAcceptSuccess?.()
        } else {
            toast.error(result.error || "Failed to accept offer")
        }
        setIsAccepting(null)
    }

    return (
        <>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleOpen}
                className="h-8 text-[10px] font-bold text-primary px-3 bg-primary/5 hover:bg-primary/10 border border-primary/20"
            >
                {fulfillmentCount} Offers Received
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md bg-surface-dark border-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Bounty Offers</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar mt-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Icons.Loader2 className="animate-spin text-primary" size={24} />
                            </div>
                        ) : fulfillments.length > 0 ? (
                            fulfillments.map((f) => (
                                <div key={f.id} className="p-4 bg-surface-darker/50 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {f.dealer?.avatar_url ? (
                                                <img src={f.dealer.avatar_url} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                f.dealer?.business_name?.[0] || 'D'
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{f.dealer?.business_name || 'Anonymous Dealer'}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-500">Trust Score: {f.dealer?.trust_score || 0}</p>
                                                {f.status === 'accepted' && (
                                                    <StatusBadge variant="success" className="text-[8px] py-0 px-1">Accepted</StatusBadge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-lg font-black text-[#19e66b]">${f.amount}</p>
                                        {f.status === 'pending' && (
                                            <Button 
                                                size="sm" 
                                                className="h-7 text-[10px] font-bold"
                                                disabled={isAccepting !== null}
                                                onClick={() => handleAccept(f.id)}
                                            >
                                                {isAccepting === f.id ? 'Accepting...' : 'Accept Offer'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8 text-sm">No offers received yet.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
