import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { coinId, amount, userId } = req.body;

  if (!coinId || !userId || typeof amount !== "number") {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    // Get the user profile to retrieve their Stripe customer ID and email
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single();

    if (userError || !userProfile) {
      console.error("Supabase user lookup error:", userError);
      return res.status(404).json({ error: "User profile not found" });
    }

    let stripeCustomerId = userProfile.stripe_customer_id;

    // If no Stripe customer yet, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email || undefined,
        metadata: { supabaseUserId: userId },
      });

      // Save the new customer ID back to Supabase
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", userId);

      stripeCustomerId = customer.id;
    }

    // Validate minimum amount
    if (amount < 0.5) {
      return res.status(400).json({ error: "Amount must be at least $0.50" });
    }

    // Retrieve coin info (optional, or you could just use coinId)
    const { data: coin, error: coinError } = await supabase
      .from("coins")
      .select("name")
      .eq("id", coinId)
      .single();

    if (coinError || !coin) {
      return res.status(404).json({ error: "Coin not found" });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Purchase of ${coin.name}`,
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    // ✅ Return a consistent response
    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
