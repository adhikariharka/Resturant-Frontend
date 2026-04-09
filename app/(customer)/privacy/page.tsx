import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy | The Kitchen",
    description: "Privacy policy and data protection information for The Kitchen",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At The Kitchen, we are committed to protecting your privacy and ensuring the security of your personal
                            information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                            when you use our website and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                        <h3 className="text-xl font-medium mb-3 mt-4">Personal Information</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Name and contact information (email, phone number)</li>
                            <li>Delivery address</li>
                            <li>Payment information (processed securely through our payment providers)</li>
                            <li>Order history and preferences</li>
                            <li>Account credentials</li>
                        </ul>

                        <h3 className="text-xl font-medium mb-3 mt-6">Automatically Collected Information</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            When you access our services, we may automatically collect:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Device information and IP address</li>
                            <li>Browser type and version</li>
                            <li>Usage data and interaction with our website</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Process and fulfill your orders</li>
                            <li>Communicate with you about your orders and account</li>
                            <li>Improve our services and user experience</li>
                            <li>Send promotional communications (with your consent)</li>
                            <li>Detect and prevent fraud or security issues</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Service providers who assist in our operations (payment processors, delivery services)</li>
                            <li>Legal authorities when required by law</li>
                            <li>Business partners with your explicit consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use cookies and similar technologies to enhance your experience, analyze usage, and deliver
                            personalized content. You can control cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Access and receive a copy of your personal data</li>
                            <li>Correct inaccurate or incomplete information</li>
                            <li>Request deletion of your personal data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Withdraw consent where processing is based on consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your personal information
                            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                            over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions or concerns about this Privacy Policy or our data practices, please contact us
                            through our <a href="/contact" className="text-primary hover:underline">contact page</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
