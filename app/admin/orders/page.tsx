import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map((order) => (
              <tr key={order.id} className="border-t hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{order.order_number}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(order.profile as any)?.full_name || (order.profile as any)?.email || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(order.created_at, { day: "numeric", month: "short", year: "2-digit" })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ORDER_STATUS_VARIANTS[order.status] || "default"}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatPrice(order.total_amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/orders/${order.id}`}>Manage</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
