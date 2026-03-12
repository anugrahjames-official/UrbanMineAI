'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { placeBid } from "@/app/actions/recycler"
import { toast } from "sonner"

export default function BidButton({ itemId }: { itemId: string }) {
    const [loading, setLoading] = useState(false)

    const handleBid = async () => {
        setLoading(true)
        try {
            await placeBid(itemId)
        } catch (error) {
            console.error("Bid failed", error)
            // toast.error("Failed to place bid")
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
