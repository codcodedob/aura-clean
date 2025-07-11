import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  // Get user email and Stripe customer ID from Supabase
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("stripe_customer_id,email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return res
      .status(500)
      .json({ error: error?.message || "User lookup failed" });
  }

  const { stripe_customer_id, email } = data;

  try {
    // @ts-expect-error TS2589: Type instantiation is excessively deep and possibly infinite
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: stripe_customer_id || undefined,
      customer_email: email,
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
      metadata: {
        coinId,
        amount: amount.toString(),
        userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Stripe checkout failed" });
  }
}
