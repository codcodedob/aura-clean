import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"];
  const path = req.headers["referer"] || null;
  const referrer = req.headers["referer"] || null;

  // If you use Vercel edge or other headers, you can get country
  const country = req.headers["x-vercel-ip-country"] || null;

  const { error } = await supabase.from("site_visits").insert([
    {
      ip: String(ip),
      user_agent: String(ua),
      path,
      referrer,
      country
    }
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Error logging visit" });
  }

  res.status(200).json({ message: "Visit logged" });
}
