import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/utils";
import { Package, User, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: recentOrders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(name, images))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your orders and account settings here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Orders", value: recentOrders?.length ?? 0, icon: Package },
          {
            label: "Total Spent",
            value: formatPrice(
              (recentOrders || []).reduce((acc, o) => acc + o.total_amount, 0)
            ),
            icon: ArrowRight,
          },
          { label: "Account Type", value: profile?.role === "admin" ? "Admin" : "Customer", icon: User },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/orders">View All</Link>
          </Button>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start shopping to see your orders here
              </p>
              <Button asChild>
                <Link href="/products">Browse Awards</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)} ·{" "}
                        {order.items?.length ?? 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={ORDER_STATUS_VARIANTS[order.status] || "default"}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                      <span className="font-semibold">
                        {formatPrice(order.total_amount)}
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Card className="hover:border-gold/40 transition-colors">
          <Link href="/dashboard/profile">
            <CardContent className="p-6 flex items-center gap-4">
              <User className="h-8 w-8 text-gold" />
              <div>
                <p className="font-semibold">Profile Settings</p>
                <p className="text-sm text-muted-foreground">
                  Update your name, company, and address
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-gold/40 transition-colors">
          <Link href="/products">
            <CardContent className="p-6 flex items-center gap-4">
              <Package className="h-8 w-8 text-gold" />
              <div>
                <p className="font-semibold">Shop Awards</p>
                <p className="text-sm text-muted-foreground">
                  Browse our full catalogue
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
