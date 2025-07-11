import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { coinId, amount, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Fetch user metadata from Supabase
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Supabase user fetch error:", userError);
      return res.status(500).json({ error: "Failed to fetch user" });
    }

    let stripeCustomerId = userData?.stripe_customer_id;

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const userInfo = await supabase.auth.admin.getUserById(userId).catch(() => null);
      const email = userInfo?.data.user?.email || "unknown@example.com";
      const customer = await stripe.customers.create({ email });
      // Save the stripe_customer_id back to Supabase
      await supabase.from("users").update({ stripe_customer_id: customer.id }).eq("id", userId);
      stripeCustomerId = customer.id;
    }

    // If coinId and amount provided, fetch coin info
    let lineItems;
    if (coinId && amount) {
      const { data: coin, error: coinError } = await supabase
        .from("coins")
        .select("name, symbol")
        .eq("id", coinId)
        .single();

      if (coinError) {
        console.error("Coin fetch error:", coinError);
        return res.status(400).json({ error: "Invalid coinId" });
      }

      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Investment in ${coin.name} (${coin.symbol ?? "COIN"})`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ];
    } else {
      // Fallback: simple test purchase for $1
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Test Product",
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: stripeCustomerId,
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
