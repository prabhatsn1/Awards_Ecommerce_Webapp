import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductImages } from "@/components/products/product-images";
import { CustomisationForm } from "@/components/customisation/customisation-form";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Truck, Shield, Star, Paintbrush } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/lib/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic metadata using async params (Next.js 16)
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Try DB first, fall back to mock
  let product: Pick<Product, "name" | "short_description" | "meta_title" | "meta_description" | "images"> | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("name, short_description, meta_title, meta_description, images")
      .eq("slug", slug)
      .single();
    product = data;
  } catch {}

  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (mock) product = mock;
  }

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || "",
    openGraph: {
      title: product.meta_title || product.name,
      description: product.meta_description || product.short_description || "",
      images: product.images.length ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Product | null = null;
  let tiers: unknown[] = [];
  let related: Product[] = [];

  try {
    const supabase = await createClient();

    const [{ data: dbProduct }, { data: dbTiers }] = await Promise.all([
      supabase
        .from("products")
        .select("*, category:categories(id, name, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single(),
      supabase
        .from("pricing_tiers")
        .select("*")
        .eq("product_id", slug)
        .order("min_quantity"),
    ]);

    if (dbProduct) {
      product = dbProduct;
      // Fetch pricing tiers by product ID
      const { data: dbTiersByid } = await supabase
        .from("pricing_tiers")
        .select("*")
        .eq("product_id", dbProduct.id)
        .order("min_quantity");
      tiers = dbTiersByid || [];

      // Related products
      const { data: dbRelated } = await supabase
        .from("products")
        .select("*, category:categories(id, name, slug)")
        .eq("category_id", dbProduct.category_id)
        .eq("is_active", true)
        .neq("id", dbProduct.id)
        .limit(4);
      related = dbRelated || [];
    }
  } catch {}

  // Fall back to mock data when DB is unavailable
  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (mock) {
      product = mock;
      related = MOCK_PRODUCTS.filter(
        (p) => p.category_id === mock.category_id && p.slug !== slug
      ).slice(0, 4);
    }
  }

  if (!product) notFound();

  // JSON-LD Product schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.base_price,
      priceCurrency: "INR",
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <span>
          <a href="/" className="hover:text-foreground">
            Home
          </a>{" "}
          /{" "}
          <a href="/products" className="hover:text-foreground">
            Shop
          </a>{" "}
          {product.category && (
            <>
              /{" "}
              <a
                href={`/products?category=${product.category.slug}`}
                className="hover:text-foreground"
              >
                {product.category.name}
              </a>{" "}
            </>
          )}
          / <span className="text-foreground">{product.name}</span>
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <ProductImages images={product.images} productName={product.name} />

        {/* Product info + form */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-bold text-navy">
                {formatPrice(product.base_price)}
              </span>
              <span className="text-sm text-muted-foreground">per unit</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.is_customisable && (
              <Badge variant="gold" className="gap-1">
                <Paintbrush className="h-3 w-3" />
                Customisable
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>{product.description}</p>
          </div>

          <Separator />

          {/* Customisation form / add to cart */}
          <CustomisationForm product={product} pricingTiers={tiers || []} />

          <Separator />

          {/* Trust signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Truck,
                title: "Free Delivery",
                desc: "On orders over ₹15,000",
              },
              { icon: Shield, title: "Quality Guarantee", desc: "100% satisfaction" },
              { icon: Star, title: "Handcrafted", desc: "By skilled artisans" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Icon className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
