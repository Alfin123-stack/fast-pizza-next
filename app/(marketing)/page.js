import Hero from "@/components/landing/Hero";
import PizzaBelt from "@/components/landing/PizzaBelt";
import Bundle from "@/components/landing/Bundle";
import HowItWorks from "@/components/landing/HowItWorks";
import Anatomy from "@/components/landing/Anatomy";
import Discover from "@/components/landing/Discover";
import Testimonials from "@/components/landing/Testimonials";
import Stories from "@/components/landing/Stories";
import { getMenu } from "@/lib/data";
import { SITE } from "@/content/landing";

const FALLBACK = [
  { id: 1, name: "Margherita", unitPrice: 12, ingredients: ["tomato", "mozzarella", "basil"] },
  { id: 2, name: "Napoli", unitPrice: 16, ingredients: ["tomato", "anchovies", "olives"] },
  { id: 3, name: "Diavola", unitPrice: 16, ingredients: ["tomato", "spicy salami", "chili"] },
  { id: 4, name: "Vegetale", unitPrice: 13, ingredients: ["tomato", "peppers", "zucchini"] },
];

async function getBeltPizzas() {
  try {
    const data = await getMenu();
    // The belt shows the original eight pizzas only; the full menu (more pizzas, drinks) lives on /menu.
    const pizzas = (data ?? []).filter((i) => i.category === "pizza" && i.id <= 8);
    return pizzas.length ? pizzas : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export const metadata = {
  title: { absolute: `${SITE.name}: ${SITE.tagline}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const pizzas = await getBeltPizzas();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE.name,
    description: SITE.description,
    servesCuisine: "Pizza",
    url: base,
    hasMenu: `${base}/menu`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <PizzaBelt pizzas={pizzas} />
      <Bundle />
      <HowItWorks />
      <Anatomy />
      <Discover />
      <Testimonials />
      <Stories />
    </>
  );
}
