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
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(
  req: IncomingMessage & { body: unknown },
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) return res.status(400).send("Missing Stripe signature");

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown webhook error";
    console.error("Webhook verification failed:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  // Handle successful checkout for business onboarding
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId || null;
    const businessName =
      session.metadata?.siteName ||
      session.metadata?.appName ||
      session.metadata?.coinName ||
      null;
    const businessRole = session.metadata?.business_role || null;
    const portfolio = session.metadata?.portfolio || null;
    const walletMethods = session.metadata?.wallet_methods || null;

    if (!userId) {
      console.error("Missing userId in metadata");
      return res.status(400).json({ error: "Missing userId in metadata" });
    }

    try {
      // Update the business profile table
      const { error: updateError } = await supabase
        .from("your_business_profile_table")
        .update({
          account_created: true,
          verification: true,
          business_name: businessName,
          business_role: businessRole,
          portfolio,
          wallet_methods: walletMethods,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      console.log(
        `✅ Business profile updated for user ${userId} (${businessName})`
      );
    } catch (error: any) {
      console.error("Error updating profile:", error.message || error);
      return res.status(500).json({ error: error.message || "Unknown error" });
    }
  }

  res.status(200).json({ received: true });
}
