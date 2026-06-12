"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Paintbrush, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();

  const handleQuickAdd = () => {
    addItem(product, 1, product.base_price);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    openCart();
  };

  const primaryImage = product.images[0] || "/placeholder-product.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-gold text-white text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.is_customisable && (
              <Badge variant="secondary" className="text-xs">
                <Paintbrush className="h-3 w-3 mr-1" />
                Customisable
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex-1 p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
              {product.category.name}
            </p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm leading-tight hover:text-gold transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>
          {product.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.short_description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-navy">
              {formatPrice(product.base_price)}
            </p>
            <p className="text-xs text-muted-foreground">per unit</p>
          </div>
          <div className="flex gap-2">
            {product.is_customisable && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/customise/${product.slug}`}>Customise</Link>
              </Button>
            )}
            <Button size="sm" onClick={handleQuickAdd} aria-label="Add to cart">
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
