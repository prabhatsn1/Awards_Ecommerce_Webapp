import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const sort = url.searchParams.get("sort") || "featured";
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const perPage = parseInt(url.searchParams.get("per_page") || "24", 10);

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)", { count: "exact" })
    .eq("is_active", true);

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("categories.slug", category);
  if (minPrice) query = query.gte("base_price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("base_price", parseFloat(maxPrice));

  switch (sort) {
    case "price-asc": query = query.order("base_price", { ascending: true }); break;
    case "price-desc": query = query.order("base_price", { ascending: false }); break;
    case "newest": query = query.order("created_at", { ascending: false }); break;
    case "name-asc": query = query.order("name", { ascending: true }); break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  });
}
