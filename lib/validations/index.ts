import { z } from "zod";

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
    company: z.string().max(100).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  company: z.string().max(100).optional().nullable(),
  phone: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^\+?[\d\s\-()]{7,20}$/.test(v),
      "Invalid phone number"
    ),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================
// Address Schema
// ============================================================

export const addressSchema = z.object({
  line1: z.string().min(3, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "County/State is required").max(100),
  postal_code: z.string().min(3, "Postal code is required").max(20),
  country: z.string().length(2, "Use ISO 2-letter country code").default("GB"),
  is_default: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============================================================
// Product Schema (admin)
// ============================================================

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(10),
  short_description: z.string().max(300).optional().nullable(),
  category_id: z.string().uuid("Invalid category"),
  base_price: z.coerce.number().positive("Price must be greater than 0"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  materials: z.array(z.string()).min(1, "Select at least one material"),
  sizes: z.array(z.string()).min(1, "Select at least one size"),
  is_customisable: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0).default(100),
  weight_grams: z.coerce.number().int().positive().optional().nullable(),
  meta_title: z.string().max(60).optional().nullable(),
  meta_description: z.string().max(160).optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;

// ============================================================
// Customisation Schema
// ============================================================

export const customisationSchema = z.object({
  engraving_text: z.string().max(200).optional(),
  material: z
    .enum(["glass", "crystal", "metal", "acrylic", "wood", "resin"])
    .optional(),
  size: z.enum(["small", "medium", "large", "extra-large"]).optional(),
  colour: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be at least 1")
    .default(1),
});

export type CustomisationInput = z.infer<typeof customisationSchema>;

// ============================================================
// Contact Schema
// ============================================================

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============================================================
// Checkout / Order Schema (server-side validation)
// ============================================================

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        customisation_data: z
          .object({
            engraving_text: z.string().max(200).optional(),
            material: z.string().optional(),
            size: z.string().optional(),
            colour: z.string().max(50).optional(),
            notes: z.string().max(500).optional(),
            logo_url: z.string().url().optional(),
          })
          .optional(),
      })
    )
    .min(1, "Cart cannot be empty"),
  shipping_address: addressSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
