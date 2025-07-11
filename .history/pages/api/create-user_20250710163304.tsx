// pages/api/create-user.ts
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, userId } = req.body;
  if (!email || !userId) {
    return res.status(400).json({ error: "Missing email or userId" });
  }

  try {
    // Check if user already exists in users table
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Some unexpected error (PGRST116 = no rows found)
      throw fetchError;
    }

    if (existingUser) {
      // User already exists, no need to insert again
      return res.status(200).json({ message: "User already exists." });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId },
    });

    // Insert into users table
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          id: userId,
          email,
          stripe_customer_id: customer.id,
        },
      ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ message: "User created successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
