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
  const [dateRange, setDateRange] = useState<"7" | "30" | "all">("7");
  const [sortBy, setSortBy] = useState<keyof Visit>("timestamp");

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/get-visits");
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
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Filtered + sorted visits
  const filteredVisits = visits
    .filter((v) => {
      if (dateRange === "all") return true;
      const days = parseInt(dateRange, 10);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      return new Date(v.timestamp).getTime() >= cutoff;
    })
    .sort((a, b) => {
      if (sortBy === "timestamp") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return String(b[sortBy] ?? "").localeCompare(String(a[sortBy] ?? ""));
    });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🌐 Site Visits</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          Date Range:
          <select
            className="border rounded px-2 py-1"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Sort By:
          <select
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as keyof Visit)}
          >
            <option value="timestamp">Date</option>
            <option value="country">Country</option>
            <option value="url">URL</option>
          </select>
        </label>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">URL</th>
              <th className="text-left p-2">IP</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Country</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit) => (
              <tr key={visit.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-sm">{new Date(visit.timestamp).toLocaleString()}</td>
                <td className="p-2 text-sm">{visit.url}</td>
                <td className="p-2 text-sm">{visit.ip}</td>
                <td className="p-2 text-sm">
                  {visit.user_id ? (
                    <span className="text-green-600 font-medium">Signed In</span>
                  ) : (
                    <span className="text-gray-500">Guest</span>
                  )}
                </td>
                <td className="p-2 text-sm">{visit.country ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
