-- ============================================================
-- AwardCraft — Full Database Schema (Supabase / PostgreSQL)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  company      TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Automatically create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE public.addresses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  line1        TEXT NOT NULL,
  line2        TEXT,
  city         TEXT NOT NULL,
  state        TEXT NOT NULL,
  postal_code  TEXT NOT NULL,
  country      TEXT NOT NULL DEFAULT 'GB',
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own addresses"
  ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  image_url    TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Insert default categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Corporate Awards', 'corporate-awards', 'Professional recognition awards for businesses', 1),
  ('Sports Trophies', 'sports-trophies', 'Trophies and medals for sporting achievements', 2),
  ('Academic Awards', 'academic-awards', 'Recognition for educational excellence', 3),
  ('Crystal Awards', 'crystal-awards', 'Premium crystal recognition pieces', 4),
  ('Metal Trophies', 'metal-trophies', 'Classic metal trophy designs', 5),
  ('Glass Awards', 'glass-awards', 'Elegant glass award pieces', 6);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT NOT NULL,
  short_description   TEXT,
  category_id         UUID NOT NULL REFERENCES public.categories(id),
  base_price          NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  images              TEXT[] NOT NULL DEFAULT '{}',
  materials           TEXT[] NOT NULL DEFAULT '{}',
  sizes               TEXT[] NOT NULL DEFAULT '{}',
  is_customisable     BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity      INT NOT NULL DEFAULT 100,
  weight_grams        INT,
  meta_title          TEXT,
  meta_description    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are publicly readable"
  ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- PRICING TIERS (volume discounts)
-- ============================================================
CREATE TABLE public.pricing_tiers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  min_quantity   INT NOT NULL CHECK (min_quantity >= 1),
  max_quantity   INT,
  price_per_unit NUMERIC(10, 2) NOT NULL CHECK (price_per_unit >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pricing tiers are publicly readable" ON public.pricing_tiers FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number              TEXT NOT NULL UNIQUE,
  user_id                   UUID NOT NULL REFERENCES public.profiles(id),
  status                    TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending','payment_processing','payment_failed','confirmed',
               'processing','shipped','delivered','cancelled','refunded')
  ),
  subtotal                  NUMERIC(10, 2) NOT NULL,
  tax_amount                NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_amount           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount              NUMERIC(10, 2) NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'gbp',
  stripe_payment_intent_id  TEXT,
  stripe_session_id         TEXT,
  shipping_address          JSONB,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
-- Service role can create orders (used in webhooks)
CREATE POLICY "Service role can insert orders"
  ON public.orders FOR INSERT WITH CHECK (TRUE);

-- Generate order number: AC-YYYYMM-NNNNN
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq_val INT;
  prefix  TEXT;
BEGIN
  prefix := 'AC-' || TO_CHAR(NOW(), 'YYYYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO seq_val
  FROM public.orders
  WHERE order_number LIKE prefix || '%';
  RETURN prefix || LPAD(seq_val::TEXT, 5, '0');
END;
$$;

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id),
  quantity            INT NOT NULL CHECK (quantity >= 1),
  unit_price          NUMERIC(10, 2) NOT NULL,
  customisation_data  JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()
  ));
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Service role can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase Dashboard → Storage)
-- ============================================================
-- Create bucket: product-images (public)
-- Create bucket: logos (private, per user)
-- Policy on product-images: public read, admin write
-- Policy on logos: authenticated users can upload to their own folder
