import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, coinId, amount } = req.body;

  if (!userId || !coinId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ✅ Get user email and Stripe customer ID from Supabase
  const { data: userProfile, error: userError } = await supabaseAdmin
    .from("users")
    .select("stripe_customer_id, email")
    .eq("id", userId)
    .single();

  if (userError || !userProfile) {
    return res.status(500).json({ error: "User lookup failed" });
  }

  const customer = userProfile.stripe_customer_id;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Purchase Coin: ${coinId}`,
              description: `Amount: $${amount}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { coinId, amount: amount.toString(), userId },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
}
