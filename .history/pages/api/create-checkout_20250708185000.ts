import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { isNullOrUndefined } from "util";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  piVersion: "2025-06-30.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { coinId, amount, userId, resaleMode } = req.body as {
      coinId: string;
      amount: number;
      userId: string;
      resaleMode?: string;
    };

    if (!coinId || typeof amount !== "number" || amount <= 0 || !userId) {
      return res.status(400).json({ error: "Invalid or missing coinId, amount, or userId" });
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("stripe_customer_id,email")
      .eq("id", userId)
      .single();

    if (userError || !userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    let stripeCustomerId = userProfile.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: userProfile.email });
      stripeCustomerId = customer.id;
      await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", userId);
    }

    const { data: coin, error: coinError } = await supabase
      .from("aura_coins")
      .select("id,name")
      .eq("id", coinId)
      .single();

    if (coinError || !coin) {
      return res.status(404).json({ error: "Coin not found" });
    }

    const unitAmount = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `AuraCoin: ${coin.name}` },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        coinId: coin.id,
        resaleMode: resaleMode || "ai",
        amount: amount.toString(),
        userId,
      },
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("❌ Checkout error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
}
