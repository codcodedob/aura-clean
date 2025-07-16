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

  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterUrl, setFilterUrl] = useState<string>("");
  const [filterIp, setFilterIp] = useState<string>("");
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterUserType, setFilterUserType] = useState<"all" | "signed" | "guest">("all");
  const [sortBy, setSortBy] = useState<"timestamp" | "url" | "ip">("timestamp");
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
      let filtered = data;

      // Apply client-side filters
      if (filterUrl) {
        filtered = filtered.filter((v) =>
          v.url.toLowerCase().includes(filterUrl.toLowerCase())
        );
      }
      if (filterIp) {
        filtered = filtered.filter((v) =>
          v.ip.toLowerCase().includes(filterIp.toLowerCase())
        );
      }
      if (filterCountry) {
        filtered = filtered.filter((v) =>
          (v.country ?? "").toLowerCase().includes(filterCountry.toLowerCase())
        );
      }
      if (filterUserType === "signed") {
        filtered = filtered.filter((v) => v.user_id);
      }
      if (filterUserType === "guest") {
        filtered = filtered.filter((v) => !v.user_id);
      }

      setVisits(filtered);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  }, [
    startDate,
    endDate,
    filterUrl,
    filterIp,
    filterCountry,
    filterUserType,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Site Visits Dashboard
      </h1>

      {/* Filters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label>Filter by URL</label>
          <input
            type="text"
            value={filterUrl}
            placeholder="e.g. /about"
            onChange={(e) => setFilterUrl(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label>Filter by IP</label>
          <input
            type="text"
            value={filterIp}
            placeholder="e.g. 192.168"
            onChange={(e) => setFilterIp(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label>Filter by Country</label>
          <input
            type="text"
            value={filterCountry}
            placeholder="e.g. US"
            onChange={(e) => setFilterCountry(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label>User Type</label>
          <select
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value as any)}
            style={{ width: "100%" }}
          >
            <option value="all">All</option>
            <option value="signed">Signed In</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        <div>
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: "100%" }}
          >
            <option value="timestamp">Timestamp</option>
            <option value="url">URL</option>
            <option value="ip">IP</option>
          </select>
        </div>
        <div>
          <label>Sort Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            style={{ width: "100%" }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div style={{ alignSelf: "end" }}>
          <button
            onClick={fetchVisits}
            style={{
              width: "100%",
              padding: "8px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Apply Filters
          </button>
        </div>
        <div style={{ alignSelf: "end" }}>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setFilterUrl("");
              setFilterIp("");
              setFilterCountry("");
              setFilterUserType("all");
              setSortBy("timestamp");
              setSortOrder("desc");
            }}
            style={{
              width: "100%",
              padding: "8px",
              background: "#ccc",
              color: "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && visits.length === 0 && <p>No visits found.</p>}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px" }}>Timestamp</th>
            <th style={{ textAlign: "left", padding: "8px" }}>URL</th>
            <th style={{ textAlign: "left", padding: "8px" }}>IP</th>
            <th style={{ textAlign: "left", padding: "8px" }}>User Agent</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Country</th>
            <th style={{ textAlign: "left", padding: "8px" }}>User</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit, i) => (
            <tr
              key={visit.id}
              style={{
                background: i % 2 === 0 ? "#fff" : "#f0f4ff",
                color: "#111",
              }}
            >
              <td style={{ padding: "8px" }}>
                {new Date(visit.timestamp).toLocaleString()}
              </td>
              <td style={{ padding: "8px" }}>{visit.url}</td>
              <td style={{ padding: "8px" }}>{visit.ip}</td>
              <td style={{ padding: "8px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {visit.user_agent}
              </td>
              <td style={{ padding: "8px" }}>{visit.country ?? "-"}</td>
              <td style={{ padding: "8px" }}>
                {visit.user_id ? `User ${visit.user_id}` : "Guest"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
