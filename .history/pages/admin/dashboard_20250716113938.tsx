import React, { useEffect, useState, useCallback } from 'react';

type Visit = {
  id: string;
  timestamp: string;
  url: string;
  ip: string;
  user_agent: string;
  country?: string;
  user_id?: string | null; // assuming you have this
};

export default function Dashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/get-visits');
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
      const data: Visit[] = await res.json();
      setVisits(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Filter visits by IP or URL
  const filteredVisits = visits.filter(
    (v) =>
      v.ip.includes(filter) ||
      v.url.toLowerCase().includes(filter.toLowerCase())
  );

  // Track which IPs have appeared so far
  const seenIPs = new Set<string>();

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '2rem auto',
        padding: '0 1rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Site Visits</h1>

      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search by IP or URL"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: 300,
            padding: '8px 12px',
            fontSize: 16,
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
      </div>

      <p style={{ marginBottom: 16, textAlign: 'center', fontWeight: '600' }}>
        Total Visits: {visits.length} | Unique IPs: {new Set(visits.map(v => v.ip)).size}
      </p>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <thead style={{ backgroundColor: '#2563eb', color: 'white' }}>
          <tr>
            <th style={{ padding: 10 }}>Unique</th>
            <th style={{ padding: 10 }}>Avatar</th>
            <th style={{ padding: 10 }}>Timestamp</th>
            <th style={{ padding: 10 }}>URL</th>
            <th style={{ padding: 10 }}>IP</th>
            <th style={{ padding: 10 }}>User Agent</th>
            <th style={{ padding: 10 }}>Country</th>
          </tr>
        </thead>
        <tbody>
          {filteredVisits.length === 0 && !loading && (
            <tr>
              <td colSpan={7} style={{ padding: 20, textAlign: 'center' }}>
                No visits found.
              </td>
            </tr>
          )}

          {filteredVisits.map((visit, i) => {
            const isUnique = !seenIPs.has(visit.ip);
            if (isUnique) seenIPs.add(visit.ip);

            return (
              <tr
                key={visit.id}
                style={{
                  backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white',
                  fontWeight: isUnique ? '700' : '400',
                  color: isUnique ? '#0c4a6e' : 'inherit',
                  transition: 'background-color 0.3s',
                }}
              >
                <td style={{ textAlign: 'center', padding: 8 }}>
                  {isUnique ? '✔️' : ''}
                </td>
                <td style={{ textAlign: 'center', padding: 8 }}>
                  {/* Simple avatar logic: show icon if user_id exists */}
                  {visit.user_id ? '👤' : 'Guest'}
                </td>
                <td style={{ padding: 8 }}>
                  {new Date(visit.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: 8, wordBreak: 'break-word', maxWidth: 180 }}>
                  {visit.url}
                </td>
                <td style={{ padding: 8 }}>{visit.ip}</td>
                <td style={{ padding: 8, maxWidth: 180, wordBreak: 'break-word' }}>
                  {visit.user_agent}
                </td>
                <td style={{ padding: 8 }}>{visit.country ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
