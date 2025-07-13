// pages/api/get-visits.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = "1", limit = "20" } = req.query;
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 20;
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  try {
    const { data, error } = await supabase
      .from("site_visits")
      .select("*")
      .order("created_at", { ascending: false }) // newest first
      .range(from, to); // pagination

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
