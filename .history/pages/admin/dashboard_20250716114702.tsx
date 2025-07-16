import React, { useEffect, useState, useCallback } from 'react';

type Visit = {
  id: string;
  timestamp: string;
  url?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  country?: string | null;
  user_id?: string | null;
};

export default function Dashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');

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

  // Get unique countries for dropdown options, ignoring null/empty
  const countries = Array.from(
    new Set(visits.map((v) => v.country).filter((c): c is string => !!c))
  ).sort();

  // Filter visits by IP or URL and country
  const filteredVisits = visits.filter((v) => {
    const matchesTextFilter =
      (v.ip ?? '').includes(filter) ||
      (v.url ?? '').toLowerCase().includes(filter.toLowerCase());
    const matchesCountryFilter =
      countryFilter === 'all' || v.country === countryFilter;
    return matchesTextFilter && matchesCountryFilter;
  });

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

      <div
        style={{
          marginBottom: 20,
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
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
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: 16,
            borderRadius: 6,
            border: '1px solid #ccc',
            minWidth: 160,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <p style={{ marginBottom: 16, textAlign: 'center', fontWeight: '600' }}>
        Total Visits: {visits.length} | Unique IPs: {new Set(visits.map((v) => v.ip ?? '')).size}
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
            const ip = visit.ip ?? '-';
            const isUnique = !seenIPs.has(ip);
            if (isUnique && ip !== '-') seenIPs.add(ip);

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
                  {visit.user_id ? '👤' : 'Guest'}
                </td>
                <td style={{ padding: 8 }}>
                  {visit.timestamp
                    ? new Date(visit.timestamp).toLocaleString()
                    : '-'}
                </td>
                <td style={{ padding: 8, wordBreak: 'break-word', maxWidth: 180 }}>
                  {visit.url ?? '-'}
                </td>
                <td style={{ padding: 8 }}>{ip}</td>
                <td style={{ padding: 8, maxWidth: 180, wordBreak: 'break-word' }}>
                  {visit.user_agent ?? '-'}
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
