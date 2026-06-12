import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// Stripe webhooks require raw body — disable body parsing
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // In Next.js 16 headers() must be awaited
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session, supabase);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(paymentIntent, supabase);
      break;
    }
    default:
      // Unhandled event type — acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>
) {
  const { user_id, shipping_address, items: rawItems } = session.metadata || {};

  if (!user_id || !rawItems) {
    console.error("[webhook] Missing metadata in session:", session.id);
    return;
  }

  let itemsParsed: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    customisation_data: Record<string, unknown> | null;
  }>;
  let shippingParsed: Record<string, string>;

  try {
    itemsParsed = JSON.parse(rawItems);
    shippingParsed = JSON.parse(shipping_address || "{}");
  } catch {
    console.error("[webhook] Failed to parse metadata JSON");
    return;
  }

  const subtotal = itemsParsed.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );
  const taxAmount = parseFloat((subtotal * 0.2).toFixed(2));
  const shippingAmount = subtotal >= 15000 ? 0 : 499;
  const totalAmount = parseFloat(
    (subtotal + taxAmount + shippingAmount).toFixed(2)
  );

  // Generate order number
  const prefix = `AC-${new Date().toISOString().slice(0, 7).replace("-", "")}-`;
  const { data: existing } = await supabase
    .from("orders")
    .select("order_number")
    .ilike("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  const lastNum =
    existing?.[0]?.order_number
      ? parseInt(existing[0].order_number.replace(prefix, ""), 10)
      : 0;
  const orderNumber = `${prefix}${String(lastNum + 1).padStart(5, "0")}`;

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id,
      status: "confirmed",
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
      currency: session.currency || "inr",
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      shipping_address: shippingParsed,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("[webhook] Failed to create order:", orderError);
    return;
  }

  // Insert order items
  const orderItems = itemsParsed.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    customisation_data: item.customisation_data,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("[webhook] Failed to insert order items:", itemsError);
  }

  console.log(`[webhook] Order ${orderNumber} created successfully`);
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createAdminClient>
) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "payment_failed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("[webhook] Failed to update order status:", error);
  }
}
