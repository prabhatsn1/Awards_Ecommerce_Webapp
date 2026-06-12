"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Paintbrush, Type, Package, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { customisationSchema, type CustomisationInput } from "@/lib/validations";
import type { Product } from "@/lib/types";
import { formatPrice, getPriceForQuantity } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const MATERIAL_LABELS: Record<string, string> = {
  glass: "Glass",
  crystal: "Crystal",
  metal: "Metal",
  acrylic: "Acrylic",
  wood: "Wood",
  resin: "Resin",
};

const SIZE_LABELS: Record<string, string> = {
  small: "Small (15cm)",
  medium: "Medium (25cm)",
  large: "Large (35cm)",
  "extra-large": "Extra Large (45cm)",
};

interface CustomisationFormProps {
  product: Product;
  pricingTiers?: Array<{
    min_quantity: number;
    max_quantity: number | null;
    price_per_unit: number;
  }>;
}

export function CustomisationForm({
  product,
  pricingTiers = [],
}: CustomisationFormProps) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomisationInput>({
    resolver: zodResolver(customisationSchema) as import('react-hook-form').Resolver<CustomisationInput>,
    defaultValues: {
      material: product.materials[0] as CustomisationInput["material"],
      size: product.sizes[0] as CustomisationInput["size"],
      quantity: 1,
    },
  });

  const watchedQuantity = watch("quantity") || 1;
  const watchedMaterial = watch("material");
  const watchedSize = watch("size");

  const unitPrice = getPriceForQuantity(
    product.base_price,
    pricingTiers,
    watchedQuantity
  );
  const totalPrice = unitPrice * watchedQuantity;

  const onSubmit = (data: import('react-hook-form').FieldValues) => {
    const typedData = data as CustomisationInput;
    const { quantity, ...customisationData } = typedData;

    addItem(
      product,
      quantity,
      unitPrice,
      // Only include non-empty customisation fields
      Object.fromEntries(
        Object.entries(customisationData).filter(([, v]) => v !== undefined && v !== "")
      ) as any
    );

    toast({
      title: "Added to cart!",
      description: `${quantity}× ${product.name} added to your cart.`,
    });
    openCart();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Engraving Text */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4 text-gold" />
            Engraving Text
          </CardTitle>
          <CardDescription>
            Add personalised text to your award (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g. Employee of the Year 2025 — Jane Smith"
            className="resize-none"
            rows={3}
            {...register("engraving_text")}
          />
          {errors.engraving_text && (
            <p className="text-xs text-destructive mt-1">
              {errors.engraving_text.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Max 200 characters
          </p>
        </CardContent>
      </Card>

      {/* Material */}
      {product.materials.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-gold" />
              Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={watchedMaterial}
              onValueChange={(v) =>
                setValue("material", v as CustomisationInput["material"])
              }
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {product.materials.map((mat) => (
                <label
                  key={mat}
                  className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-all ${
                    watchedMaterial === mat
                      ? "border-gold bg-gold/5"
                      : "hover:border-muted-foreground"
                  }`}
                >
                  <RadioGroupItem value={mat} id={`material-${mat}`} />
                  <span className="text-sm font-medium">
                    {MATERIAL_LABELS[mat] || mat}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Size */}
      {product.sizes.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gold" />
              Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={watchedSize}
              onValueChange={(v) =>
                setValue("size", v as CustomisationInput["size"])
              }
              className="grid grid-cols-2 gap-3"
            >
              {product.sizes.map((size) => (
                <label
                  key={size}
                  className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-all ${
                    watchedSize === size
                      ? "border-gold bg-gold/5"
                      : "hover:border-muted-foreground"
                  }`}
                >
                  <RadioGroupItem value={size} id={`size-${size}`} />
                  <span className="text-sm font-medium">
                    {SIZE_LABELS[size] || size}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-gold" />
            Additional Notes
          </CardTitle>
          <CardDescription>
            Any special requirements or instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g. Match our company brand colours (gold and navy)..."
            className="resize-none"
            rows={3}
            {...register("notes")}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Quantity & Pricing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="quantity" className="text-base font-medium">
            Quantity
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setValue("quantity", Math.max(1, watchedQuantity - 1))
              }
            >
              −
            </Button>
            <Input
              id="quantity"
              type="number"
              min={1}
              className="w-16 text-center"
              {...register("quantity")}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setValue("quantity", watchedQuantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
        {errors.quantity && (
          <p className="text-xs text-destructive">{errors.quantity.message}</p>
        )}

        {/* Pricing tiers hint */}
        {pricingTiers.length > 0 && (
          <div className="bg-gold/10 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-gold">Volume discounts available</p>
            {pricingTiers.map((tier) => (
              <p key={tier.min_quantity} className="text-xs text-muted-foreground">
                {tier.min_quantity}
                {tier.max_quantity ? `–${tier.max_quantity}` : "+"} units:{" "}
                <span className="font-medium">{formatPrice(tier.price_per_unit)}</span>{" "}
                each
              </p>
            ))}
          </div>
        )}

        {/* Price summary */}
        <div className="flex items-end justify-between py-3 border-t">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatPrice(unitPrice)} × {watchedQuantity}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-navy">
              {formatPrice(totalPrice)}
            </p>
            <p className="text-xs text-muted-foreground">excl. VAT & shipping</p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="xl"
        className="w-full bg-navy hover:bg-navy/90"
        disabled={isSubmitting}
      >
        Add to Cart
      </Button>
    </form>
  );
}
