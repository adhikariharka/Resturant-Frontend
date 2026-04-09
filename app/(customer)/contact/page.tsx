"use client"

import type { Metadata } from "next"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useGetContactInfoQuery, useGetHoursQuery } from "@/lib/store/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ContactPage() {
    const { data: contactInfo, isLoading: contactLoading } = useGetContactInfoQuery(undefined)
    const { data: hours = [], isLoading: hoursLoading } = useGetHoursQuery(undefined)

    if (contactLoading || hoursLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Contact Us</h1>
                <p className="text-lg text-muted-foreground mb-12">
                    Get in touch with us for any questions, feedback, or special requests.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Address</p>
                                    <p className="text-muted-foreground">{contactInfo?.address || '123 High Street, London'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-muted-foreground">{contactInfo?.phone || '+44 20 1234 5678'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">{contactInfo?.email || 'hello@thekitchen.com'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Opening Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Opening Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {hours.length > 0 ? (
                                    hours.map((h: any, i: number) => (
                                        <div key={i} className="flex justify-between">
                                            <span className="font-medium">{h.day}</span>
                                            <span className="text-muted-foreground">
                                                {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">Loading hours...</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Have Questions?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            We're here to help! Whether you have questions about our menu, need assistance with an order,
                            or have special dietary requirements, don't hesitate to reach out. Our team is available during
                            business hours to assist you.
                        </p>
                        <p className="text-muted-foreground mt-4">
                            For urgent matters related to active orders, please call us directly at{' '}
                            <span className="font-medium text-foreground">{contactInfo?.phone || '+44 20 1234 5678'}</span>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
