// ============================================================
// Core Domain Types — mirrors Supabase DB schema
// ============================================================

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export type ProductMaterial = "glass" | "crystal" | "metal" | "acrylic" | "wood" | "resin";
export type ProductSize = "small" | "medium" | "large" | "extra-large";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  category_id: string;
  category?: Category;
  base_price: number;
  images: string[];
  materials: ProductMaterial[];
  sizes: ProductSize[];
  is_customisable: boolean;
  is_featured: boolean;
  is_active: boolean;
  stock_quantity: number;
  weight_grams: number | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: string;
  product_id: string;
  label: string;
  min_quantity: number;
  max_quantity: number | null;
  price_per_unit: number;
  created_at: string;
}

export interface CustomisationData {
  engraving_text?: string;
  logo_url?: string;
  material?: ProductMaterial;
  size?: ProductSize;
  colour?: string;
  notes?: string;
}

export type OrderStatus =
  | "pending"
  | "payment_processing"
  | "payment_failed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  customisation_data: CustomisationData | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  profile?: Profile;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  shipping_address: Address | null;
  notes: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// Cart Types (client-side only, persisted in localStorage)
// ============================================================

export interface CartItem {
  id: string; // product.id + JSON(customisation) as unique key
  product: Product;
  quantity: number;
  unit_price: number;
  customisation?: CustomisationData;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
}

// ============================================================
// API Response Helpers
// ============================================================

export interface ApiResponse<T = undefined> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
