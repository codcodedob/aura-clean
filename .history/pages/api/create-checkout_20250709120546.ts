import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

interface UserProfile {
  id: string;
  stripe_customer_id: string | null;
  email: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("👉 Incoming request to /api/create-checkout");
  console.log("🔹 Request method:", req.method);
  console.log("🔹 Request body:", req.body);

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
    console.error("❌ Missing required fields:", { userId, coinId, amount });
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data: userProfile, error: userError } = await supabase
    .from<UserProfile>("users")
    .select("id, stripe_customer_id, email")
    .eq("id", userId)
    .single();

  console.log("🔍 Supabase user lookup:", { userProfile, userError });

  if (userError || !userProfile) {
    return res.status(500).json({ error: userError?.message || "User not found in DB" });
  }

  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    mode: "payment",
    //customer_email: userProfile.email ?? undefined,
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
  };

  if (userProfile.stripe_customer_id) {
    checkoutParams.customer = userProfile.stripe_customer_id;
  }

  try {
    console.log("💳 Creating Stripe Checkout Session...");

    const session = await stripe.checkout.sessions.create(checkoutParams);

    console.log("✅ Stripe session created:", { id: session.id, url: session.url });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
