import React, { useEffect, useState, useCallback } from "react";

type Visit = {
  id: string;
  timestamp: string;
  url: string;
  ip: string;
  user_agent: string;
  country?: string;
  user_id?: string | null;
};

export default function Dashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/get-visits?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
      const data: Visit[] = await res.json();
      setVisits(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Site Visits</h1>

      <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: 4 }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: 4 }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "6px 8px", borderRadius: 4 }}>
          <option value="timestamp">Date</option>
          <option value="url">URL</option>
          <option value="ip">IP</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")} style={{ padding: "6px 8px", borderRadius: 4 }}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <button
          onClick={fetchVisits}
          style={{ padding: "6px 12px", borderRadius: 4, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600 }}
        >
          Apply Filters
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ccc", color: "#111" }}>Timestamp</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ccc", color: "#111" }}>URL</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ccc", color: "#111" }}>IP</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ccc", color: "#111" }}>User Agent</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ccc", color: "#111" }}>Country</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ccc", color: "#111" }}>User</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit, idx) => (
            <tr
              key={visit.id}
              style={{
                background: idx % 2 === 0 ? "#fff" : "#f9f9f9"
              }}
            >
              <td style={{ padding: "8px", color: "#111" }}>
                {new Date(visit.timestamp).toLocaleString()}
              </td>
              <td style={{ padding: "8px", color: "#111" }}>{visit.url}</td>
              <td style={{ padding: "8px", color: "#111" }}>{visit.ip}</td>
              <td style={{ padding: "8px", color: "#111" }}>{visit.user_agent}</td>
              <td style={{ padding: "8px", color: "#111" }}>{visit.country ?? "-"}</td>
              <td style={{ padding: "8px", color: "#111" }}>
                {visit.user_id ? (
                  <span style={{ fontWeight: "bold" }}>Signed In</span>
                ) : (
                  "Guest"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
