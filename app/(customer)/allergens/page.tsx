import type { Metadata } from "next"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Allergen Information | The Kitchen",
    description: "Important allergen and dietary information for The Kitchen menu items",
}

export default function AllergensPage() {
    const commonAllergens = [
        { name: "Gluten", description: "Found in wheat, barley, rye, and oats" },
        { name: "Crustaceans", description: "Includes crab, lobster, prawns, and shrimp" },
        { name: "Eggs", description: "Present in many baked goods and sauces" },
        { name: "Fish", description: "Including all fish species" },
        { name: "Peanuts", description: "Ground nuts and peanut-derived products" },
        { name: "Soybeans", description: "Soy sauce, tofu, and soy-based products" },
        { name: "Milk", description: "Dairy products including lactose" },
        { name: "Tree Nuts", description: "Almonds, hazelnuts, walnuts, cashews, etc." },
        { name: "Celery", description: "Including celery stalks, leaves, and seeds" },
        { name: "Mustard", description: "Mustard seeds, powder, and prepared mustard" },
        { name: "Sesame", description: "Sesame seeds and sesame oil" },
        { name: "Sulphites", description: "Preservatives found in some foods and wines" },
        { name: "Lupin", description: "Lupin seeds and flour" },
        { name: "Molluscs", description: "Mussels, oysters, squid, and snails" },
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Allergen Information</h1>

                {/* Warning Banner */}
                <Card className="mb-8 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important Notice</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    If you have a food allergy or intolerance, please contact us before placing your order.
                                    While we take precautions to prevent cross-contamination, our kitchen handles all major
                                    allergens, and we cannot guarantee that any dish is completely allergen-free.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="prose prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At The Kitchen, we take food allergies and intolerances seriously. We are committed to providing
                            accurate allergen information and accommodating dietary requirements wherever possible. All our
                            staff are trained in allergen awareness and food safety protocols.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">14 Major Allergens</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            UK law requires food businesses to provide allergen information for the following 14 major allergens:
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            {commonAllergens.map((allergen) => (
                                <Card key={allergen.name}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">{allergen.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{allergen.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">How to Identify Allergens</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Allergen information is available for all menu items:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Check the menu item description for allergen tags</li>
                            <li>View detailed allergen information on each product page</li>
                            <li>Contact us directly if you need specific allergen information</li>
                            <li>Speak with our staff when placing your order</li>
                        </ul>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Cross-Contamination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Despite our best efforts to prevent cross-contamination, our kitchen prepares food containing all
                            major allergens. We use shared equipment and preparation areas, which means traces of allergens may
                            be present in dishes that don't list them as ingredients.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            If you have a severe allergy, please inform us when ordering so we can take extra precautions.
                            However, we cannot guarantee a completely allergen-free environment.
                        </p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Special Dietary Requirements</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We offer options for various dietary requirements, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                            <li>Vegetarian dishes</li>
                            <li>Vegan options</li>
                            <li>Gluten-free alternatives (where available)</li>
                            <li>Dairy-free options</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Please note that while we accommodate these requirements, cross-contamination may still occur.
                        </p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Ingredient Changes</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We occasionally update our recipes and ingredients. Allergen information is kept up-to-date, but
                            if you have a severe allergy, we recommend confirming allergen details each time you order,
                            especially if it's been a while since your last order.
                        </p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions about allergens or need specific dietary information, please don't hesitate
                            to contact us through our <a href="/contact" className="text-primary hover:underline">contact page</a> or
                            call us directly. We're here to help ensure you can enjoy our food safely.
                        </p>
                    </section>

                    <Card className="mt-8 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
                        <CardContent className="pt-6">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Disclaimer:</strong> The allergen information provided is based on standard recipes and
                                ingredient specifications. While we make every effort to ensure accuracy, we cannot guarantee that
                                our dishes are completely free from allergens. If you have a food allergy or intolerance, please
                                exercise caution and contact us before ordering.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
