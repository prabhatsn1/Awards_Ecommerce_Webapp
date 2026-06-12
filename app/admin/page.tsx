import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/utils";
import { Package, ShoppingBag, Users, TrendingUp, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: recentOrders },
    { data: revenue },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*, profile:profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("total_amount")
      .in("status", ["confirmed", "processing", "shipped", "delivered"]),
  ]);

  const totalRevenue = (revenue || []).reduce(
    (acc, o) => acc + o.total_amount,
    0
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Products", value: productCount ?? 0, icon: ShoppingBag, href: "/admin/products" },
          { label: "Orders", value: orderCount ?? 0, icon: Package, href: "/admin/orders" },
          { label: "Customers", value: userCount ?? 0, icon: Users, href: "#" },
          { label: "Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, href: "#" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Card key={label} className="hover:shadow-sm transition-shadow">
            <Link href={href}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-gold" />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Order</th>
                  <th className="text-left py-2 font-medium">Customer</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{order.order_number}</td>
                    <td className="py-3 text-muted-foreground">
                      {(order.profile as any)?.full_name || (order.profile as any)?.email || "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(order.created_at, { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={ORDER_STATUS_VARIANTS[order.status] || "default"}
                        className="text-xs"
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="py-3 pl-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/admin/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Manage Products
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/admin/orders">
            <Package className="mr-2 h-4 w-4" />
            Manage Orders
          </Link>
        </Button>
      </div>
    </div>
  );
}
