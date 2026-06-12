import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyUs } from "@/components/home/why-us";
import { createClient } from "@/lib/supabase/server";
import { MOCK_FEATURED_PRODUCTS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "AwardCraft — Premium Bespoke Awards & Trophies",
  description:
    "Shop premium bespoke awards, trophies, and recognition pieces. Fully customisable. Free delivery on orders over ₹15,000.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AwardCraft",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://awardcraft.co.uk",
  description: "Premium bespoke awards and trophies.",
};

export default async function HomePage() {
  let featuredProducts = MOCK_FEATURED_PRODUCTS;

  try {
    const supabase = await createClient();

    const { data: dbFeatured } = await supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("is_featured", true)
      .eq("is_active", true)
      .limit(4)
      .order("created_at", { ascending: false });

    if (dbFeatured && dbFeatured.length > 0) {
      featuredProducts = dbFeatured;
    } else {
      throw new Error("no db data");
    }
  } catch {
    // DB unavailable — using mock data
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <WhyUs />
    </>
  );
}
