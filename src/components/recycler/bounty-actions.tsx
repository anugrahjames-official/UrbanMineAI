'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteBounty } from '@/app/actions/bounty'
import { toast } from 'sonner'
import { BountyModal } from './create-bounty-modal'

interface BountyActionsProps {
    bounty: any
}

export function BountyActions({ bounty }: BountyActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this bounty?')) return

        setIsDeleting(true)
        const result = await deleteBounty(bounty.id)
        setIsDeleting(false)

        if (result.success) {
            toast.success('Bounty deleted successfully')
        } else {
            toast.error(result.error || 'Failed to delete bounty')
        }
    }

    return (
        <div className="flex items-center gap-2">
            <BountyModal bounty={bounty} />
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash2 size={14} />
            </Button>
        </div>
    )
}
