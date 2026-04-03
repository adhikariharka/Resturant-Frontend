"use client"

import { useState, useEffect } from "react"
import { useGetContactInfoQuery, useUpdateContactInfoMutation } from "@/lib/store/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"

export function ContactInfoContent() {
    const { data: contactInfo, isLoading } = useGetContactInfoQuery(undefined)
    const [updateContactInfo, { isLoading: isUpdating }] = useUpdateContactInfoMutation()

    const [formData, setFormData] = useState({
        restaurantName: "",
        email: "",
        phone: "",
        address: "",
    })

    // Update form when data loads
    useEffect(() => {
        if (contactInfo) {
            setFormData({
                restaurantName: contactInfo.restaurantName || "",
                email: contactInfo.email || "",
                phone: contactInfo.phone || "",
                address: contactInfo.address || "",
            })
        }
    }, [contactInfo])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await updateContactInfo(formData).unwrap()
            alert("Contact information updated successfully")
        } catch (error) {
            alert("Failed to update contact information")
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Contact Information</h2>
                <p className="text-muted-foreground">
                    Manage restaurant contact details displayed on the website
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                    <CardDescription>
                        This information will be displayed in the footer and contact page
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="restaurantName">Restaurant Name</Label>
                            <Input
                                id="restaurantName"
                                value={formData.restaurantName}
                                onChange={(e) =>
                                    setFormData({ ...formData, restaurantName: e.target.value })
                                }
                                placeholder="The Kitchen"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="hello@thekitchen.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder="+44 20 1234 5678"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="123 High Street, London"
                                required
                            />
                        </div>

                        <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
