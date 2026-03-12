'use client'

import { useState, useActionState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Pencil, Check, ChevronsUpDown, Sparkles, MapPin } from 'lucide-react'
import { createBounty, updateBounty, generateBountyDescription, CreateBountyState } from '@/app/actions/bounty'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const initialState: CreateBountyState = {
    message: '',
    errors: {}
}

const metals = [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
    { value: "platinum", label: "Platinum" },
    { value: "palladium", label: "Palladium" },
    { value: "copper", label: "Copper" },
    { value: "aluminum", label: "Aluminum" },
    { value: "lead", label: "Lead" },
    { value: "nickel", label: "Nickel" },
    { value: "zinc", label: "Zinc" },
    { value: "tin", label: "Tin" },
    { value: "lithium", label: "Lithium" },
    { value: "cobalt", label: "Cobalt" },
    { value: "steel", label: "Steel" },
    { value: "iron", label: "Iron" },
    { value: "pcb", label: "PCB" },
    { value: "e-waste", label: "E-Waste" },
]

const grades = [
    { value: "grade-a", label: "Grade A" },
    { value: "grade-b", label: "Grade B" },
    { value: "grade-c", label: "Grade C" },
    { value: "high-grade", label: "High Grade" },
    { value: "low-grade", label: "Low Grade" },
    { value: "industrial", label: "Industrial" },
    { value: "consumer", label: "Consumer" },
    { value: "mixed", label: "Mixed" },
    { value: "clean", label: "Clean" },
    { value: "insulated", label: "Insulated" },
    { value: "bare", label: "Bare" },
]

interface BountyModalProps {
    defaultLocation?: string
    bounty?: {
        id: string
        title: string
        material: string
        min_grade: string
        quantity: number
        unit: string
        price_floor: number
        expires_at: string
        metadata?: any
    }
}

export function BountyModal({ bounty, defaultLocation }: BountyModalProps) {
    const [open, setOpen] = useState(false)
    const [comboboxOpen, setComboboxOpen] = useState(false)
    const [gradeComboboxOpen, setGradeComboboxOpen] = useState(false)
    const action = bounty ? updateBounty : createBounty
    const [state, formAction, isPending] = useActionState(action, initialState)
    const [lastSuccessTime, setLastSuccessTime] = useState<number>(0)
    const [selectedMaterial, setSelectedMaterial] = useState(bounty?.material || "")
    const [selectedGrade, setSelectedGrade] = useState(bounty?.min_grade || "")
    const [unit, setUnit] = useState(bounty?.unit || 'kg')
    const [searchValue, setSearchValue] = useState("")
    const [gradeSearchValue, setGradeSearchValue] = useState("")

    // New Fields
    // Use metadata location if available, otherwise defaultLocation, otherwise empty
    const initialLocation = bounty?.metadata?.location || defaultLocation || "";
    const initialDescription = bounty?.metadata?.description || "";

    const [location, setLocation] = useState(initialLocation);
    const [description, setDescription] = useState(initialDescription);
    const [title, setTitle] = useState(bounty?.title || "");
    const [quantity, setQuantity] = useState(bounty?.quantity?.toString() || "");
    const [price, setPrice] = useState(bounty?.price_floor?.toString() || "");

    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-switch unit based on material
    useEffect(() => {
        if (!bounty) { // Only auto-switch for new bounties
            const lowerMat = selectedMaterial.toLowerCase()
            if (/gold|silver|platinum|palladium|rhodium|iridium|ruthenium|osmium/i.test(lowerMat)) {
                setUnit('toz')
            } else if (lowerMat) {
                setUnit('kg')
            }
        }
    }, [selectedMaterial, bounty])

    useEffect(() => {
        if (state.message && state.timestamp && state.timestamp > lastSuccessTime) {
            if (state.errors || !state.message.includes('successfully')) {
                toast.error(state.message)
            } else {
                toast.success(state.message)
                setOpen(false)
            }
            setLastSuccessTime(state.timestamp)
        }
    }, [state, lastSuccessTime])

    // Generate Description handler
    const handleGenerateDescription = async () => {
        if (!selectedMaterial) {
            toast.error("Please select a material first.");
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateBountyDescription(
                title,
                selectedMaterial,
                selectedGrade,
                quantity,
                unit,
                price
            );

            if (result.description) {
                setDescription(result.description);
                toast.success("Description generated!");
            } else {
                toast.error("Failed to generate description.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };

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
            <DialogContent className="bg-surface-dark border-white/10 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Urgent Copper Requirement"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="material" className="text-sm font-medium text-gray-300">
                            Material Needed *
                        </label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white"
                                >
                                    {selectedMaterial
                                        ? selectedMaterial
                                        : "Select material..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-surface-dark border-white/10 text-white">
                                <Command className="bg-transparent">
                                    <CommandInput
                                        placeholder="Search material..."
                                        className="h-9 text-white placeholder:text-gray-500"
                                        value={searchValue}
                                        onValueChange={setSearchValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        {searchValue && !metals.some(m => m.label.toLowerCase() === searchValue.toLowerCase()) && (
                                            <CommandGroup heading="Custom">
                                                <CommandItem
                                                    value={searchValue}
                                                    onSelect={() => {
                                                        setSelectedMaterial(searchValue)
                                                        setComboboxOpen(false)
                                                    }}
                                                    className="text-primary data-[selected='true']:bg-white/10 hover:bg-white/5 cursor-pointer"
                                                >
                                                    <Plus size={14} className="mr-2" />
                                                    Use "{searchValue}"
                                                </CommandItem>
                                            </CommandGroup>
                                        )}
                                        <CommandGroup heading="Standard Metals">
                                            {metals.map((metal) => (
                                                <CommandItem
                                                    key={metal.value}
                                                    value={metal.label}
                                                    onSelect={(currentValue) => {
                                                        const originalMetal = metals.find(m => m.label.toLowerCase() === currentValue.toLowerCase());
                                                        setSelectedMaterial(originalMetal ? originalMetal.label : currentValue)
                                                        setComboboxOpen(false)
                                                    }}
                                                    className="data-[selected='true']:bg-white/10 text-white hover:bg-white/5 cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedMaterial === metal.label ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {metal.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name="material" value={selectedMaterial} />
                        {state.errors?.material && (
                            <p className="text-xs text-red-400">{state.errors.material[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="min_grade" className="text-sm font-medium text-gray-300">
                            Minimum Grade
                        </label>
                        <Popover open={gradeComboboxOpen} onOpenChange={setGradeComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    role="combobox"
                                    aria-expanded={gradeComboboxOpen}
                                    className="w-full justify-between bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white"
                                >
                                    {selectedGrade
                                        ? selectedGrade
                                        : "Select grade..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-surface-dark border-white/10 text-white">
                                <Command className="bg-transparent">
                                    <CommandInput
                                        placeholder="Search grade..."
                                        className="h-9 text-white placeholder:text-gray-500"
                                        value={gradeSearchValue}
                                        onValueChange={setGradeSearchValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        {gradeSearchValue && !grades.some(g => g.label.toLowerCase() === gradeSearchValue.toLowerCase()) && (
                                            <CommandGroup heading="Custom">
                                                <CommandItem
                                                    value={gradeSearchValue}
                                                    onSelect={() => {
                                                        setSelectedGrade(gradeSearchValue)
                                                        setGradeComboboxOpen(false)
                                                    }}
                                                    className="text-primary data-[selected='true']:bg-white/10 hover:bg-white/5 cursor-pointer"
                                                >
                                                    <Plus size={14} className="mr-2" />
                                                    Use "{gradeSearchValue}"
                                                </CommandItem>
                                            </CommandGroup>
                                        )}
                                        <CommandGroup heading="Standard Grades">
                                            {grades.map((grade) => (
                                                <CommandItem
                                                    key={grade.value}
                                                    value={grade.label}
                                                    onSelect={(currentValue) => {
                                                        const originalGrade = grades.find(g => g.label.toLowerCase() === currentValue.toLowerCase());
                                                        setSelectedGrade(originalGrade ? originalGrade.label : currentValue)
                                                        setGradeComboboxOpen(false)
                                                    }}
                                                    className="data-[selected='true']:bg-white/10 text-white hover:bg-white/5 cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedGrade === grade.label ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {grade.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name="min_grade" value={selectedGrade} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="quantity" className="text-sm font-medium text-gray-300">
                                Quantity ({unit}) *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                                    required
                                />
                                <div className="flex bg-black/20 border border-white/10 rounded-md overflow-hidden shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setUnit('kg')}
                                        className={cn("px-2 py-2 text-xs font-medium transition-colors", unit === 'kg' ? "bg-primary text-black" : "text-gray-400 hover:text-white")}
                                    >
                                        kg
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUnit('toz')}
                                        className={cn("px-2 py-2 text-xs font-medium transition-colors", unit === 'toz' ? "bg-primary text-black" : "text-gray-400 hover:text-white")}
                                    >
                                        toz
                                    </button>
                                    <input type="hidden" name="unit" value={unit} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="price_floor" className="text-sm font-medium text-gray-300">
                                Target Price ($/{unit})
                            </label>
                            <input
                                id="price_floor"
                                name="price_floor"
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Location Field */}
                    <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium text-gray-300 flex items-center gap-1">
                            <MapPin size={14} /> Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. New York, NY"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600"
                        />
                    </div>

                    {/* Description Field with AI Generation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="description" className="text-sm font-medium text-gray-300">
                                Description
                            </label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating}
                                className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        Generate with AI
                                    </>
                                )}
                            </Button>
                        </div>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe your requirement... or click 'Generate with AI'"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-gray-600 resize-none"
                        />
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
