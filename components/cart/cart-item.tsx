"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "@/hooks/use-toast";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleRemove = () => {
    removeItem(item.id);
    toast({
      title: "Removed from cart",
      description: `${item.product.name} has been removed.`,
    });
  };

  const primaryImage = item.product.images[0] || "/placeholder-product.jpg";

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      {/* Image */}
      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <Image
          src={primaryImage}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="text-sm font-medium hover:text-gold transition-colors line-clamp-2"
        >
          {item.product.name}
        </Link>

        {/* Customisation summary */}
        {item.customisation && (
          <div className="mt-0.5 space-y-0.5">
            {item.customisation.engraving_text && (
              <p className="text-xs text-muted-foreground truncate">
                Engraving: {item.customisation.engraving_text}
              </p>
            )}
            {item.customisation.material && (
              <p className="text-xs text-muted-foreground">
                Material: {item.customisation.material}
              </p>
            )}
            {item.customisation.size && (
              <p className="text-xs text-muted-foreground">
                Size: {item.customisation.size}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm w-6 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">
              {formatPrice(item.unit_price * item.quantity)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              aria-label="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
