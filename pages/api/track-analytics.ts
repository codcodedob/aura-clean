// pages/api/track-analytics.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    visit_id,
    user_id,
    session_id,
    event_type,
    event_value,
    duration_seconds,
    scroll_depth,
    device_type,
    screen_resolution,
    browser,
    os,
    referrer,
    utm_source,
    utm_campaign,
  } = req.body;

  try {
    const { error } = await supabase.from("site_analytics").insert([
      {
        visit_id,
        user_id,
        session_id,
        event_type,
        event_value,
        duration_seconds,
        scroll_depth,
        device_type,
        screen_resolution,
        browser,
        os,
        referrer,
        utm_source,
        utm_campaign,
      },
    ]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error logging analytics event" });
    }

    return res.status(200).json({ message: "Analytics event logged" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
