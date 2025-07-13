import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Visit = {
  id: string;
  created_at: string;
  ip: string;
  user_agent: string;
  path: string | null;
  referrer: string | null;
  country: string | null;
};

export default function AdminSiteVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    fetchVisits();
  }, []);

  async function fetchVisits() {
    const { data, error } = await supabase
      .from("site_visits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setVisits(data || []);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Site Visits</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#222", color: "#fff" }}>
            <th style={{ padding: 8 }}>Date</th>
            <th style={{ padding: 8 }}>IP</th>
            <th style={{ padding: 8 }}>Path</th>
            <th style={{ padding: 8 }}>Referrer</th>
            <th style={{ padding: 8 }}>Country</th>
            <th style={{ padding: 8 }}>User Agent</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: 8 }}>{new Date(v.created_at).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{v.ip}</td>
              <td style={{ padding: 8 }}>{v.path}</td>
              <td style={{ padding: 8 }}>{v.referrer}</td>
              <td style={{ padding: 8 }}>{v.country}</td>
              <td style={{ padding: 8, wordBreak: "break-all" }}>{v.user_agent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
