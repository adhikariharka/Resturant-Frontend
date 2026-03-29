"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCreateAddressMutation } from "@/lib/store/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const addressSchema = z.object({
    label: z.string().min(1, "Label is required"),
    line1: z.string().min(1, "Address Line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    postcode: z.string().min(1, "Postcode is required"),
    isDefault: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    onSuccess?: (addressId: string) => void
}

export function AddressDialog({ open, onOpenChange, userId, onSuccess }: AddressDialogProps) {
    const [createAddress, { isLoading }] = useCreateAddressMutation()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: "Home",
            line1: "",
            line2: "",
            city: "",
            postcode: "",
            isDefault: false,
        },
    })

    const setLabel = (label: string) => {
        setValue("label", label, { shouldValidate: true, shouldDirty: true })
    }

    const onSubmit = async (data: AddressFormValues) => {
        try {
            const result = await createAddress({
                ...data,
                userId,
            }).unwrap()

            toast.success("Address added successfully")
            reset()
            onOpenChange(false)
            if (onSuccess) {
                onSuccess(result.id)
            }
        } catch (error) {
            console.error("Failed to add address:", error)
            toast.error("Failed to add address")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Delivery Address</DialogTitle>
                    <DialogDescription>
                        Add a new address to your account for delivery.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="label">Label</Label>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-normal" onClick={() => setLabel("Home")}>Home</Badge>
                                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-normal" onClick={() => setLabel("Work")}>Work</Badge>
                                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-normal" onClick={() => setLabel("Other")}>Other</Badge>
                            </div>
                        </div>
                        <Input id="label" {...register("label")} placeholder="e.g. Home" />
                        {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="line1">Address Line 1</Label>
                        <Input id="line1" {...register("line1")} placeholder="123 Main St" />
                        {errors.line1 && <p className="text-sm text-destructive">{errors.line1.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                        <Input id="line2" {...register("line2")} placeholder="Apartment, Suite, etc." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register("city")} placeholder="London" />
                            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postcode">Postcode</Label>
                            <Input id="postcode" {...register("postcode")} placeholder="SW1A 1AA" />
                            {errors.postcode && <p className="text-sm text-destructive">{errors.postcode.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <input
                            type="checkbox"
                            id="isDefault"
                            {...register("isDefault")}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer font-medium">Set as default delivery address</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Address
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
