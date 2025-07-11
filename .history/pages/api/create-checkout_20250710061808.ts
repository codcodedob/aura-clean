import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
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
    // Fetch user from your users table, which contains stripe_customer_id
    interface UserProfile {
  stripe_customer_id: string | null;
  email: string | null;
}

const { data: userProfile, error: userError } = await supabase
  .from<UserProfile>("users")
  .select("stripe_customer_id, email")
  .eq("id", userId)
  .single();

if (userError || !userProfile) {
  console.error("Supabase user lookup error:", userError);
  return res.status(404).json({ error: "User profile not found" });
}

// Now you have userProfile.stripe_customer_id and userProfile.email safely typed


    if (userError || !userProfile) {
      console.error("Supabase user lookup error:", userError);
      return res.status(404).json({ error: "User profile not found" });
    }

    let stripeCustomerId = userProfile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email || undefined,
        metadata: { supabaseUserId: userId },
      });

      // Save Stripe customer ID back to your users table
      await supabase
        .from("users")
        .update({ stripe_customer_id: customer.id })
        .eq("id", userId);

      stripeCustomerId = customer.id;
    }

    // Validate minimum amount ($0.50)
    if (amount < 0.5) {
      return res.status(400).json({ error: "Amount must be at least $0.50" });
    }

    // Fetch coin info
    const { data: coin, error: coinError } = await supabase
      .from("aura_coins")
      .select("name")
      .eq("id", coinId)
      .single();

    if (coinError || !coin) {
      return res.status(404).json({ error: "Coin not found" });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Purchase of ${coin.name}` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
