import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomisationForm } from "@/components/customisation/customisation-form";
import { ProductImages } from "@/components/products/product-images";
import { Badge } from "@/components/ui/badge";

interface CustomisePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CustomisePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("slug", slug)
    .single();

  return {
    title: product ? `Customise ${product.name}` : "Customise Award",
    description: "Personalise your award with engraving, logo, material, and size options.",
  };
}

export default async function CustomisePage({ params }: CustomisePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_customisable", true)
    .single();

  if (!product) notFound();

  const { data: tiers } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("product_id", product.id)
    .order("min_quantity");

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <div className="mb-8">
        <Badge variant="gold" className="mb-3">Customisation Studio</Badge>
        <h1 className="text-3xl font-bold">Customise: {product.name}</h1>
        <p className="text-muted-foreground mt-2">
          Personalise every detail to make this award uniquely yours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Preview */}
        <div className="space-y-4">
          <ProductImages images={product.images} productName={product.name} />
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-sm">Available Options</h3>
            <div className="flex flex-wrap gap-1">
              {product.materials.map((m: string) => (
                <Badge key={m} variant="secondary" className="text-xs capitalize">{m}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((s: string) => (
                <Badge key={s} variant="outline" className="text-xs capitalize">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Customisation form */}
        <CustomisationForm product={product} pricingTiers={tiers || []} />
      </div>
    </div>
  );
}
