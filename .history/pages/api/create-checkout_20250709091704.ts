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
  console.log("👉 Incoming request to /api/create-checkout-session");
  console.log("🔹 Request method:", req.method);
  console.log("🔹 Request body:", req.body);

  if (req.method !== "POST") {
    console.warn("⚠️ Invalid method:", req.method);
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

  // Fetch user profile from your custom `users` table
  const { data: userProfile, error: userError } = await supabase
    .from<UserProfile>("users")
    .select("id, stripe_customer_id, email")
    .eq("id", userId)
    .single();

  console.log("🔍 Supabase user lookup:");
  console.log("🔸 userProfile:", userProfile);
  console.log("🔸 userError:", userError);

  if (userError || !userProfile) {
    return res.status(500).json({ error: userError?.message || "User not found in DB" });
  }

  // ⚠️ Optional: remove these if you want Stripe to ask for card/email each time
  const stripeCustomerId = userProfile.stripe_customer_id ?? undefined;
  const email = userProfile.email ?? undefined;

  try {
    console.log("💳 Creating Stripe Checkout Session...");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // Comment these lines to force card entry each time
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

    console.log("✅ Stripe session created:", {
      id: session.id,
      url: session.url,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
