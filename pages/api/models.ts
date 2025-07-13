// File: pages/api/models.ts

import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, error } = await supabase.from("models").select();

    if (error) {
      throw error;
    }

    res.status(200).json({ models: data });
  } catch (error) {
    // Narrow the error to something with a message
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: message });
  }
}
