'use client'

import { useState, useActionState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Pencil } from 'lucide-react'
import { createBounty, updateBounty, CreateBountyState } from '@/app/actions/bounty'
import { toast } from 'sonner'

const initialState: CreateBountyState = {
    message: '',
    errors: {}
}

interface BountyModalProps {
    bounty?: {
        id: string
        title: string
        material: string
        min_grade: string
        quantity_kg: number
        price_floor: number
        expires_at: string
    }
}

export function BountyModal({ bounty }: BountyModalProps) {
    const [open, setOpen] = useState(false)
    const action = bounty ? updateBounty : createBounty
    const [state, formAction, isPending] = useActionState(action, initialState)
    const [lastSuccessTime, setLastSuccessTime] = useState<number>(0)

    useEffect(() => {
        if (state.message) {
            if (state.errors) {
                toast.error(state.message)
            } else if (state.message.includes('successfully') && state.timestamp && state.timestamp > lastSuccessTime) {
                toast.success(state.message)
                setLastSuccessTime(state.timestamp)
                setOpen(false)
            }
        }
    }, [state, lastSuccessTime])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {bounty ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-white">
                        <Pencil size={14} />
                    </Button>
                ) : (
                    <Button className="gap-2 shadow-glow-primary">
                        <Plus size={18} /> Create Bounty
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-surface-dark border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{bounty ? 'Edit Bounty' : 'Create New Bounty'}</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-4 mt-4">
                    {bounty && <input type="hidden" name="id" value={bounty.id} />}

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-300">
                            Listing Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            defaultValue={bounty?.title || ''}
                            placeholder="e.g. Urgent Copper Requirement"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="material" className="text-sm font-medium text-gray-300">
                            Material Needed *
                        </label>
                        <input
                            id="material"
                            name="material"
                            defaultValue={bounty?.material || ''}
                            placeholder="e.g. Copper Wire, PCB"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                            required
                        />
                        {state.errors?.material && (
                            <p className="text-xs text-red-400">{state.errors.material[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="min_grade" className="text-sm font-medium text-gray-300">
                            Minimum Grade
                        </label>
                        <input
                            id="min_grade"
                            name="min_grade"
                            defaultValue={bounty?.min_grade || ''}
                            placeholder="e.g. Grade A"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="quantity_kg" className="text-sm font-medium text-gray-300">
                                Quantity (kg) *
                            </label>
                            <input
                                id="quantity_kg"
                                name="quantity_kg"
                                type="number"
                                step="0.01"
                                defaultValue={bounty?.quantity_kg || ''}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="price_floor" className="text-sm font-medium text-gray-300">
                                Target Price ($/kg)
                            </label>
                            <input
                                id="price_floor"
                                name="price_floor"
                                type="number"
                                step="0.01"
                                defaultValue={bounty?.price_floor || ''}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="expires_at" className="text-sm font-medium text-gray-300">
                            Expires At
                        </label>
                        <input
                            id="expires_at"
                            name="expires_at"
                            type="date"
                            defaultValue={bounty?.expires_at ? new Date(bounty.expires_at).toISOString().split('T')[0] : ''}
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600 [color-scheme:dark]"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="hover:bg-white/5 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="shadow-glow-primary">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {bounty ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                bounty ? 'Update Bounty' : 'Create Bounty'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
