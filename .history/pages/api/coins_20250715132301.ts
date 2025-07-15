// pages/api/coins.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// 🟢 Make sure this is defined BEFORE the handler
type Coin = {
  id: string;
  name: string;
  emoji: string | null;
  price: number;
  cap: number;
  img_Url: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const offset = parseInt(req.query.offset as string, 10) || 0;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Service role key not found in env." });
  }

  try {
    const { data, error } = await supabase
    .from("aura_coins")
    .select("*") // just a string with column names or '*'
    .order("price", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(error.message);
  
  const coins = data as Coin[];
  
  res.status(200).json(coins);
  
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ API /coins error:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
