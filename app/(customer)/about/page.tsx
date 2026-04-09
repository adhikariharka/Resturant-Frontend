import type { Metadata } from "next"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export const metadata: Metadata = {
    title: "About Us | The Kitchen",
    description: "Learn about The Kitchen - our story, mission, and commitment to quality dining",
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About Us</h1>

                <div className="prose prose-lg max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to The Kitchen, where culinary excellence meets convenience. Founded with a passion for
                            bringing restaurant-quality dining to your doorstep, we've been serving our community with dedication
                            and care since our inception.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Our journey began with a simple belief: everyone deserves access to delicious, freshly prepared meals
                            made with the finest ingredients. Today, we continue to uphold this vision by crafting each dish with
                            attention to detail and a commitment to quality that sets us apart.
                        </p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At The Kitchen, our mission is to deliver exceptional dining experiences that bring joy to every meal.
                            We source the freshest local ingredients, employ skilled chefs who are passionate about their craft,
                            and maintain the highest standards of food safety and quality.
                        </p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Quality First:</strong> We never compromise on the quality of our ingredients or preparation.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Customer Satisfaction:</strong> Your happiness is our top priority, and we go the extra mile to ensure it.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Sustainability:</strong> We're committed to sustainable practices and supporting local suppliers.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Innovation:</strong> We continuously evolve our menu to bring you exciting new flavors and dishes.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Behind every delicious meal is a dedicated team of culinary professionals, from our experienced chefs
                            to our friendly delivery staff. Each member of The Kitchen family is committed to providing you with
                            an outstanding experience, from the moment you place your order to the moment it arrives at your door.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
