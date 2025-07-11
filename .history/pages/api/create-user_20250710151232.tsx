// pages/api/create-user.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Admin client (Service Role)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("Supabase createUser error:", error);
    return res.status(400).json({ error: error.message });
  }

  // Insert into your 'users' table
  const { error: insertError } = await supabaseAdmin
    .from("users")
    .insert({
      id: data.user?.id,
      email,
      stripe_customer_id: null,
    });

  if (insertError) {
    console.error("Insert error:", insertError);
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true });
}
