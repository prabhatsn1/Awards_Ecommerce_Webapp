import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Product</h1>
      <AdminProductForm product={product} />
    </div>
  );
}
