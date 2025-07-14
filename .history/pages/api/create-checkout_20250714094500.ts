import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import type { UserProfile } from "@/lib/types"; // import the type

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, coinId, amount } = req.body as {
    userId: string;
    coinId: string;
    amount: number;
  };

  // Use explicit type annotation for `userProfile`
  const {
    data: userProfile,
    error: userError,
  }: {
    data: UserProfile | null;
    error: any;
  } = await supabase
    .from("users")
    .select("id, stripe_customer_id, email")
    .eq("id", userId)
    .single();

  if (userError || !userProfile) {
    return res
      .status(500)
      .json({ error: userError?.message || "User not found in database." });
  }

  // continue logic...
}
