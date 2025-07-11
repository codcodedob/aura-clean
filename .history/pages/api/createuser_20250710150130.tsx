import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const stripeCustomer = await stripe.customers.create({
    email,
    description: `Customer for ${email}`,
  });

  await supabaseAdmin.from("users").insert({
    id: data.user?.id,
    email,
    stripe_customer_id: stripeCustomer.id,
  });

  return res.status(200).json({ success: true });
}
