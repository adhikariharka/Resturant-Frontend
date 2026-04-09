import { Metadata } from "next"
import { Info, ShieldAlert, Timer, Utensils, Coins, MapPin, AlertTriangle, Truck } from "lucide-react"

export const metadata: Metadata = {
    title: "Cancellation Policy | The Kitchen",
    description: "Read our cancellation policy regarding orders, refunds, and delivery.",
}

export default function CancellationPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-10 text-center">
                <h1 className="font-serif text-4xl font-bold mb-4">Cancellation Policy</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    We understand that plans change. Here is everything you need to know about cancelling your order with The Kitchen.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Point 1: Cooking Status */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-full text-orange-600 dark:text-orange-400">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Cooking Status</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Once your order status changes to <strong>"Cooking"</strong>, we cannot accept any cancellations. Our chefs have already begun preparing your meal to ensure freshness and quality.
                    </p>
                </div>

                {/* Point 2: Payment Window */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-full text-blue-600 dark:text-blue-400">
                            <Timer className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Payment Expiry</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        For card payments, you have a <strong>5-minute window</strong> to complete the transaction after placing the order. If payment is not received within this time, your order will be automatically cancelled.
                    </p>
                </div>



                {/* Point 5: Quality Issues */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-full text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Quality & Missing Items</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        If there are issues with food quality or missing items, please report them <strong>immediately upon delivery</strong> with photos if possible. We prioritize resolving these issues swiftly.
                    </p>
                </div>

                {/* Point 6: Unattended Delivery */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-full text-indigo-600 dark:text-indigo-400">
                            <Truck className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Unattended Delivery</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Our drivers will wait for a maximum of <strong>5 minutes</strong> at the delivery address. If you are unreachable, the driver may leave, and the order will be marked as delivered without refund.
                    </p>
                </div>

                {/* Point 7: Allergies */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2.5 rounded-full text-yellow-600 dark:text-yellow-400">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Allergy Notice</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        It is your responsibility to state allergies clearly in the order notes. Cancellations due to undeclared allergies after preparation has started are <strong>non-refundable</strong>.
                    </p>
                </div>

                {/* Point 8: Management Discretion */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-full text-gray-600 dark:text-gray-400">
                            <Info className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Management Discretion</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        The Kitchen reserves the right to cancel any order due to unforeseen circumstances (e.g., stock shortages, safety concerns). In such rare cases, a <strong>full refund</strong> will be issued immediately.
                    </p>
                </div>
            </div>
        </div>
    )
}
