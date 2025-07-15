// File: pages/api/stripe-business-webhook.ts

import { buffer } from "micro";
import Stripe from "stripe";
import type { NextApiResponse } from "next";
import type { IncomingMessage } from "http";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const endpointSecret = process.env.STRIPE_BUSINESS_WEBHOOK_SECRET || "";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: IncomingMessage & { body: unknown },
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) return res.status(400).send("Missing Stripe signature");

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown webhook error";
    console.error("❌ Webhook verification failed:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId || null;
    if (!userId) {
      console.error("❌ Missing userId in metadata");
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const now = new Date().toISOString();

      const { error: insertError } = await supabase
        .from("your_activity_table")
        .insert({
          user_id: userId,
          type: "service b2b",
          state: "paid",
          status: "present",
          detail: "Stripe payment completed",
          products: ["business", "development"],
          productids: [session.id],
          enteractive: "5e0b4651-ad50-4c52-be01-5a4f170ebe5b",
          active: "a6a0899d-044a-45cf-81d1-1339e8ce2dd9",
          activitystarttimestamp: now,
          activestartdate: now,
          updated_at: now,
        });

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      console.log(`✅ Activity record created for user ${userId}`);
    } catch (error: any) {
      console.error("❌ Error inserting activity:", error.message || error);
      return res.status(500).json({ error: error.message || "Unknown error" });
    }
  }

  res.status(200).json({ received: true });
}
