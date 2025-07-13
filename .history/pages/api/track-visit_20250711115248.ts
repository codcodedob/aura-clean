import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"];
  const path = req.headers["referer"] || "/";

  const { error } = await supabase.from("site_visits").insert([
    {
      url: String(path),
      ip: String(ip),
      user_agent: String(ua)
    }
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Error logging visit" });
  }

  res.status(200).json({ message: "Visit logged" });
}
