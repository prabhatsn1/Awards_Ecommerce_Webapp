import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price number as INR currency string */
export function formatPrice(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Convert a product name to URL-safe slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Get initials from a name string */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

/** Format a date to a readable string */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", options);
}

/** Calculate the best unit price based on quantity and pricing tiers */
export function getPriceForQuantity(
  basePrice: number,
  tiers: Array<{
    min_quantity: number;
    max_quantity: number | null;
    price_per_unit: number;
  }>,
  quantity: number
): number {
  if (!tiers.length) return basePrice;

  const matchingTier = tiers.find(
    (t) =>
      quantity >= t.min_quantity &&
      (t.max_quantity === null || quantity <= t.max_quantity)
  );

  return matchingTier ? matchingTier.price_per_unit : basePrice;
}

/** Calculate order totals */
export function calculateOrderTotals(
  subtotal: number,
  taxRate = 0.18,
  freeShippingThreshold = 15000
) {
  const shippingAmount = subtotal >= freeShippingThreshold ? 0 : 499;
  const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + taxAmount + shippingAmount).toFixed(2));
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax_amount: taxAmount,
    shipping_amount: shippingAmount,
    total,
  };
}

/** Get Supabase public URL for a storage file */
export function getStorageUrl(
  bucket: string,
  path: string,
  supabaseUrl: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/** Convert order status to a human-readable label */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  payment_processing: "Processing Payment",
  payment_failed: "Payment Failed",
  confirmed: "Order Confirmed",
  processing: "Being Made",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Map order status to a UI colour variant */
export const ORDER_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  payment_processing: "secondary",
  payment_failed: "destructive",
  confirmed: "default",
  processing: "default",
  shipped: "default",
  delivered: "outline",
  cancelled: "destructive",
  refunded: "secondary",
};
