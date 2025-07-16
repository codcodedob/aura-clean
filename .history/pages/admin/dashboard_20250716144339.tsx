// ./pages/admin/dashboard.tsx
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
  const [sortBy, setSortBy] = useState<"timestamp" | "url" | "ip">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterUserType, setFilterUserType] = useState<"all" | "signed" | "guest">("all");

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

  const filteredVisits = visits.filter((v) => {
    if (filterUserType === "all") return true;
    if (filterUserType === "signed") return v.user_id !== null;
    if (filterUserType === "guest") return !v.user_id;
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Site Visits Dashboard</h1>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "timestamp" | "url" | "ip")
            }
          >
            <option value="timestamp">Timestamp</option>
            <option value="url">URL</option>
            <option value="ip">IP</option>
          </select>
        </div>
        <div>
          <label>Order:</label>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "asc" | "desc")
            }
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div>
          <label>User Type:</label>
          <select
            value={filterUserType}
            onChange={(e) =>
              setFilterUserType(e.target.value as "all" | "signed" | "guest")
            }
          >
            <option value="all">All</option>
            <option value="signed">Signed In</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        <button
          onClick={fetchVisits}
          style={{
            padding: "0.5rem 1rem",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
            alignSelf: "flex-end",
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: "0.5rem" }}>Timestamp</th>
              <th>URL</th>
              <th>IP</th>
              <th>User Agent</th>
              <th>Country</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit, i) => (
              <tr
                key={visit.id}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#f9fafb",
                }}
              >
                <td style={{ padding: "0.5rem" }}>
                  {new Date(visit.timestamp).toLocaleString()}
                </td>
                <td>{visit.url}</td>
                <td>{visit.ip}</td>
                <td style={{ maxWidth: 200, wordBreak: "break-all" }}>{visit.user_agent}</td>
                <td>{visit.country ?? "-"}</td>
                <td>
                  {visit.user_id ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>Signed In</span>
                  ) : (
                    <span style={{ color: "gray" }}>Guest</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredVisits.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                  No visits found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
