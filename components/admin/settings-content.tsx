"use client"

import { useState } from "react"
import { DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    useGetRestaurantSettingsQuery,
    useUpdateRestaurantSettingsMutation,
    useGetHoursQuery,
    useUpdateHoursMutation,
} from "@/lib/store/api"
import { toast } from "sonner"

export function AdminSettingsContent() {
    const { data: settings, isLoading } = useGetRestaurantSettingsQuery(undefined)
    const { data: hours = [] } = useGetHoursQuery(undefined)
    const [updateSettings, { isLoading: isUpdating }] = useUpdateRestaurantSettingsMutation()
    const [updateHours] = useUpdateHoursMutation()

    const [taxRate, setTaxRate] = useState("")
    const [serviceCharge, setServiceCharge] = useState("")

    // Update local state when settings load
    useState(() => {
        if (settings) {
            setTaxRate((settings.taxRate * 100).toString())
            setServiceCharge((settings.serviceCharge * 100).toString())
        }
    })

    const handleUpdateSettings = async () => {
        try {
            await updateSettings({
                taxRate: parseFloat(taxRate) / 100,
                serviceCharge: parseFloat(serviceCharge) / 100,
            }).unwrap()
            toast.success("Settings updated successfully")
        } catch (error) {
            toast.error("Failed to update settings")
        }
    }

    const handleUpdateHours = async (id: string, data: any) => {
        try {
            await updateHours({ id, ...data }).unwrap()
            toast.success("Hours updated")
        } catch (error) {
            toast.error("Failed to update hours")
        }
    }

    if (isLoading) {
        return <div>Loading settings...</div>
    }

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const sortedHours = [...hours].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

    return (
        <div className="space-y-6">
            {/* Tax and Service Charge */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Pricing Configuration
                    </CardTitle>
                    <CardDescription>Set tax rates and service charges applied to orders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="taxRate">Tax Rate (%)</Label>
                            <Input
                                id="taxRate"
                                type="number"
                                step="0.01"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                placeholder="20"
                            />
                            <p className="text-xs text-muted-foreground">Current: {settings?.taxRate ? (settings.taxRate * 100).toFixed(2) : 0}%</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                            <Input
                                id="serviceCharge"
                                type="number"
                                step="0.01"
                                value={serviceCharge}
                                onChange={(e) => setServiceCharge(e.target.value)}
                                placeholder="10"
                            />
                            <p className="text-xs text-muted-foreground">Current: {settings?.serviceCharge ? (settings.serviceCharge * 100).toFixed(2) : 0}%</p>
                        </div>
                    </div>
                    <Button onClick={handleUpdateSettings} disabled={isUpdating}>
                        {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
                <CardHeader>
                    <CardTitle>Opening Hours</CardTitle>
                    <CardDescription>Manage restaurant opening hours (London timezone)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sortedHours.map((hour: any) => (
                            <div key={hour.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="w-24 font-medium">{hour.day}</div>
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        type="time"
                                        value={hour.openTime}
                                        onChange={(e) => handleUpdateHours(hour.id, { openTime: e.target.value })}
                                        className="w-32"
                                        disabled={hour.isClosed}
                                    />
                                    <span className="text-muted-foreground">to</span>
                                    <Input
                                        type="time"
                                        value={hour.closeTime}
                                        onChange={(e) => handleUpdateHours(hour.id, { closeTime: e.target.value })}
                                        className="w-32"
                                        disabled={hour.isClosed}
                                    />
                                </div>
                                <Button
                                    variant={hour.isClosed ? "outline" : "secondary"}
                                    size="sm"
                                    onClick={() => handleUpdateHours(hour.id, { isClosed: !hour.isClosed })}
                                >
                                    {hour.isClosed ? "Closed" : "Open"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
