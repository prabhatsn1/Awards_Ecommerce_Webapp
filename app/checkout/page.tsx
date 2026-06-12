"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CartItemRow } from "@/components/cart/cart-item";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { addressSchema } from "@/lib/validations";
import { toast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax_amount, shipping_amount, total } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "GB", is_default: false } as z.infer<typeof addressSchema>,
  });

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const onSubmit = async (address: z.infer<typeof addressSchema>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            customisation_data: item.customisation,
          })),
          shipping_address: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description:
          err instanceof Error ? err.message : "Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping form */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input
                    id="line1"
                    placeholder="123 High Street"
                    {...register("line1")}
                    className="mt-1"
                  />
                  {errors.line1 && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.line1.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="line2">Address Line 2 (optional)</Label>
                  <Input
                    id="line2"
                    placeholder="Flat / Suite"
                    {...register("line2")}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="London"
                      {...register("city")}
                      className="mt-1"
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">County / State</Label>
                    <Input
                      id="state"
                      placeholder="Greater London"
                      {...register("state")}
                      className="mt-1"
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postal_code">Postcode</Label>
                    <Input
                      id="postal_code"
                      placeholder="SW1A 1AA"
                      {...register("postal_code")}
                      className="mt-1"
                    />
                    {errors.postal_code && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.postal_code.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country Code</Label>
                    <Input
                      id="country"
                      placeholder="GB"
                      {...register("country")}
                      className="mt-1"
                    />
                    {errors.country && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="xl"
              className="w-full bg-navy hover:bg-navy/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay Securely with Stripe
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secured by Stripe. Your payment info is never stored on our servers.
            </p>
          </form>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%)</span>
                  <span>{formatPrice(tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping_amount === 0 ? "FREE" : formatPrice(shipping_amount)}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
