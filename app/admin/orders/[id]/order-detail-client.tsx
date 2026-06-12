"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const ORDER_STATUSES = [
  "pending",
  "payment_processing",
  "payment_failed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

interface AdminOrderDetailClientProps {
  order: Order;
}

export function AdminOrderDetailClient({ order }: AdminOrderDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);

    if (error) {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    } else {
      toast({ title: "Order updated", description: `Status changed to ${ORDER_STATUS_LABELS[status]}` });
      router.refresh();
    }
    setIsUpdating(false);
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/admin/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStatusUpdate} disabled={isUpdating || status === order.status}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  {item.customisation_data?.engraving_text && (
                    <p className="text-xs text-muted-foreground">
                      Engraving: {item.customisation_data.engraving_text}
                    </p>
                  )}
                </div>
                <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_amount === 0 ? "FREE" : formatPrice(order.shipping_amount)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {order.shipping_address && (
          <Card>
            <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-0.5">
              <p>{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
              <p>{order.shipping_address.city}</p>
              <p>{order.shipping_address.postal_code}</p>
              <p>{order.shipping_address.country}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
