"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear cart after successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 max-w-2xl py-20 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your order. We&apos;ve received it and will begin
            crafting your awards straight away.
          </p>
        </div>

        {sessionId && (
          <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
            <p>Reference: {sessionId.slice(-12).toUpperCase()}</p>
            <p className="mt-1">
              A confirmation email will be sent to your registered address.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button asChild className="flex-1">
            <Link href="/dashboard/orders">
              <Package className="mr-2 h-4 w-4" />
              Track Order
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/products">
              Shop More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
