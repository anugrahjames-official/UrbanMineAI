'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { updateItemMetadata } from "@/app/actions/dealer"
import { toast } from "sonner"

interface EditItemDialogProps {
    isOpen: boolean
    onClose: () => void
    item: {
        id: string
        title: string
        weight: string
        grade: string
        value: string | number
    }
}

export default function EditItemDialog({ isOpen, onClose, item }: EditItemDialogProps) {
    const [title, setTitle] = useState(item.title)
    const [weight, setWeight] = useState(item.weight)
    const [grade, setGrade] = useState(item.grade)
    const [value, setValue] = useState(item.value.toString())
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateItemMetadata(item.id, {
                title: title,
                weight: weight,
                grade: grade,
                estimatedValue: value
            })
            toast.success("Item updated successfully")
            onClose()
        } catch (error) {
            console.error("Failed to update item:", error)
            toast.error("Failed to update item")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-surface-darker border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Item Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Title / Classification</label>
                        <input
                            className="w-full bg-surface-dark border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600 text-white"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Laptop Motherboard"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Weight</label>
                            <input
                                className="w-full bg-surface-dark border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600 text-white"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g. 0.5 kg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Grade</label>
                            <input
                                className="w-full bg-surface-dark border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600 text-white"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="e.g. Grade A"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Estimated Value</label>
                        <input
                            className="w-full bg-surface-dark border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600 text-white"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="e.g. $5.42"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving} className="border-white/10">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="shadow-glow-primary">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
