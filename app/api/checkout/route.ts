import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { checkoutSchema } from "@/lib/validations";
import { calculateOrderTotals } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input with Zod
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, shipping_address } = parsed.data;

    // Fetch products from DB to get authoritative prices (never trust client prices)
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, base_price, images, is_active, stock_quantity")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    // Validate all products exist, are active, and have stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        );
      }
      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product is no longer available: ${product.name}` },
          { status: 400 }
        );
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Build Stripe line items using server-side prices
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!;
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: product.images.slice(0, 1),
            metadata: {
              product_id: product.id,
              customisation: item.customisation_data
                ? JSON.stringify(item.customisation_data)
                : "",
            },
          },
          unit_amount: Math.round(product.base_price * 100), // Stripe uses pence
        },
        quantity: item.quantity,
      };
    });

    // Calculate totals for metadata
    const subtotal = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.product_id)!;
      return acc + product.base_price * item.quantity;
    }, 0);
    const totals = calculateOrderTotals(subtotal);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      // Add shipping as a separate line item if applicable
      ...(totals.shipping_amount > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: Math.round(totals.shipping_amount * 100),
                    currency: "inr",
                  },
                  display_name: "Standard Delivery",
                },
              },
            ],
          }
        : {}),
      customer_email: user.email,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        user_id: user.id,
        shipping_address: JSON.stringify(shipping_address),
        items: JSON.stringify(
          items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            unit_price: products.find((p) => p.id === i.product_id)!.base_price,
            customisation_data: i.customisation_data || null,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[checkout] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
