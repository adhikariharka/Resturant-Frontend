import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service | The Kitchen",
    description: "Terms and conditions for using The Kitchen's services",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing and using The Kitchen's website and services, you agree to be bound by these Terms of
                            Service and all applicable laws and regulations. If you do not agree with any of these terms, you are
                            prohibited from using our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Use of Services</h2>
                        <h3 className="text-xl font-medium mb-3 mt-4">Account Registration</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            To place orders, you must create an account and provide accurate, complete information. You are
                            responsible for maintaining the confidentiality of your account credentials and for all activities
                            that occur under your account.
                        </p>

                        <h3 className="text-xl font-medium mb-3 mt-6">Acceptable Use</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            You agree to use our services only for lawful purposes and in accordance with these Terms. You must not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe upon the rights of others</li>
                            <li>Transmit harmful or malicious code</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Use our services for fraudulent purposes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Orders and Payments</h2>
                        <h3 className="text-xl font-medium mb-3 mt-4">Order Acceptance</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any
                            order for any reason, including but not limited to product availability, errors in pricing or product
                            information, or suspected fraudulent activity.
                        </p>

                        <h3 className="text-xl font-medium mb-3 mt-6">Pricing and Payment</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            All prices are displayed in GBP and include applicable taxes unless otherwise stated. Payment must be
                            made at the time of order placement. We accept various payment methods as indicated on our website.
                        </p>

                        <h3 className="text-xl font-medium mb-3 mt-6">Service Charges and Taxes</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Additional charges such as service fees, delivery fees, and applicable taxes will be clearly displayed
                            before you complete your order.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Delivery</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We strive to deliver your orders within the estimated time frame. However, delivery times are
                            approximate and may vary due to factors beyond our control. You must provide accurate delivery
                            information and be available to receive your order.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            If you are not available to receive your order, we may leave it at the specified location at your
                            risk. We are not responsible for orders that are lost, stolen, or damaged after delivery.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Cancellations and Refunds</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Orders can be cancelled within a limited time after placement. Once food preparation has begun,
                            cancellations may not be possible. Refunds will be processed in accordance with our refund policy
                            and may take several business days to appear in your account.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            If you receive an incorrect or unsatisfactory order, please contact us immediately so we can resolve
                            the issue.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Food Safety and Allergens</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We take food safety seriously and follow all applicable regulations. However, if you have food
                            allergies or dietary restrictions, please review our <a href="/allergens" className="text-primary hover:underline">allergen information</a> and
                            contact us if you have specific concerns.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            We cannot guarantee that our products are completely free from allergens due to potential
                            cross-contamination during preparation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All content on our website, including text, graphics, logos, images, and software, is the property
                            of The Kitchen or its licensors and is protected by copyright and other intellectual property laws.
                            You may not reproduce, distribute, or create derivative works without our express written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To the fullest extent permitted by law, The Kitchen shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages arising out of or related to your use of our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. Changes will be effective
                            immediately upon posting to our website. Your continued use of our services after changes are posted
                            constitutes your acceptance of the modified terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions about these Terms of Service, please contact us through our{' '}
                            <a href="/contact" className="text-primary hover:underline">contact page</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
