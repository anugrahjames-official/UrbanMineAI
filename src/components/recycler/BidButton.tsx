'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { placeBid } from "@/app/actions/recycler"
import { toast } from "sonner"

export default function BidButton({ itemId }: { itemId: string }) {
    const [loading, setLoading] = useState(false)

    const handleBid = async () => {
        const amountStr = window.prompt("Enter your bid amount ($):");
        if (!amountStr) return;
        
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true)
        try {
            const result = await placeBid(itemId, amount)
            if (result.success) {
                toast.success(`Bid of $${amount} placed successfully!`)
            }
        } catch (error: any) {
            console.error("Bid failed", error)
            toast.error(error.message || "Failed to place bid")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            className="h-8 text-[10px] font-bold shadow-glow-primary px-4"
            onClick={handleBid}
            disabled={loading}
        >
            {loading ? 'Starting...' : 'Bid Now'}
        </Button>
    )
}
