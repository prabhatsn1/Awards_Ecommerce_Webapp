import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminOrderDetailClient } from "./order-detail-client";

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(name, slug, images))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return <AdminOrderDetailClient order={order} />;
}
