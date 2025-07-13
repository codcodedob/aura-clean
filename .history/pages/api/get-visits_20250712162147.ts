import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract query params for pagination and filtering
  const { page = "1", pageSize = "50", urlFilter = "" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);
  const from = (pageNum - 1) * pageSizeNum;
  const to = from + pageSizeNum - 1;

  try {
    let query = supabase
      .from("site_visits")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(from, to);

    // Optional filter by URL substring
    if (urlFilter) {
      query = query.ilike("url", `%${urlFilter}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      visits: data,
      page: pageNum,
      pageSize: pageSizeNum,
      total: data?.length ?? 0
    });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Failed to fetch visits" });
  }
}
