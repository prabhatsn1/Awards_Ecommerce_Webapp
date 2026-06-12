import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop Awards & Trophies",
  description:
    "Browse our extensive collection of premium awards, trophies, and recognition pieces. Filter by category, material, and price.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

// In Next.js 16, searchParams is a Promise
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await the async searchParams (Next.js 16 requirement)
  const params = await searchParams;

  let products: Product[] = [];
  let categories = MOCK_CATEGORIES;

  try {
    const supabase = await createClient();

    const [{ data: dbCategories }, productsResult] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      (async () => {
        let query = supabase
          .from("products")
          .select("*, category:categories(id, name, slug)")
          .eq("is_active", true);

        if (params.search) {
          query = query.ilike("name", `%${params.search}%`);
        }
        if (params.category) {
          query = query.eq("categories.slug", params.category);
        }
        if (params.minPrice) {
          query = query.gte("base_price", parseFloat(params.minPrice));
        }
        if (params.maxPrice) {
          query = query.lte("base_price", parseFloat(params.maxPrice));
        }

        switch (params.sort) {
          case "price-asc":
            query = query.order("base_price", { ascending: true });
            break;
          case "price-desc":
            query = query.order("base_price", { ascending: false });
            break;
          case "newest":
            query = query.order("created_at", { ascending: false });
            break;
          case "name-asc":
            query = query.order("name", { ascending: true });
            break;
          default:
            query = query
              .order("is_featured", { ascending: false })
              .order("created_at", { ascending: false });
        }

        return query;
      })(),
    ]);

    if (dbCategories && dbCategories.length > 0) categories = dbCategories;
    if (productsResult.data && productsResult.data.length > 0) {
      products = productsResult.data;
    } else {
      // DB returned nothing (no data or error) — fall back to mock
      throw new Error("no db data");
    }
  } catch {
    // DB unavailable — filter mock data client-side
    let filtered = [...MOCK_PRODUCTS];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (params.category) {
      filtered = filtered.filter(
        (p) => p.category?.slug === params.category
      );
    }
    if (params.minPrice) {
      filtered = filtered.filter(
        (p) => p.base_price >= parseFloat(params.minPrice!)
      );
    }
    if (params.maxPrice) {
      filtered = filtered.filter(
        (p) => p.base_price <= parseFloat(params.maxPrice!)
      );
    }

    switch (params.sort) {
      case "price-asc":
        filtered.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.base_price - a.base_price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        filtered.sort(
          (a, b) => Number(b.is_featured) - Number(a.is_featured)
        );
    }

    products = filtered;
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Shop Awards</h1>
        <p className="text-muted-foreground mt-2">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-20">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
