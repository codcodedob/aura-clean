import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import Stripe from "stripe";
import { Database } from "@/types/supabase"; // adjust path if needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { coinId, amount, userId } = req.body;

  if (!coinId || !userId || typeof amount !== "number") {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    // Fetch user with Stripe customer id and email
    const { data, error: userError } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single();

    if (userError || !data) {
      console.error("User lookup error:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    const userProfile = data as UserRow;

    let stripeCustomerId = userProfile.stripe_customer_id;

    // Create Stripe customer if missing
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email ?? undefined,
        metadata: { supabaseUserId: userId },
      });

      // Update user with new customer ID
      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: customer.id })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update Stripe customer ID:", updateError);
      }

      stripeCustomerId = customer.id;
    }

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
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return res.status(200).json({ sessionId: session.id });
    
  } catch (error: any) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
