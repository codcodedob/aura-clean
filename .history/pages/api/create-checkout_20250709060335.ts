import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-10-04",
});

interface UserProfile {
  id: string;
  stripe_customer_id: string | null;
  email: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId, coinId, amount } = req.body as {
    userId: string;
    coinId: string;
    amount: number;
  };

  if (!userId || !coinId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Fetch user info with explicit typing
  const { data: userProfile, error: userError } = await supabase
    .from<UserProfile>("users")
    .select("id, stripe_customer_id, email")
    .eq("id", userId)
    .single();

  if (userError || !userProfile) {
    return res.status(500).json({ error: userError?.message || "User not found" });
  }

  const stripeCustomerId = userProfile.stripe_customer_id ?? undefined;
  const email = userProfile.email ?? undefined;

  try {
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: stripeCustomerId,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Purchase of ${coinId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        coinId,
        amount: amount.toString(),
        userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
