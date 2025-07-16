import React, { useEffect, useState, useCallback } from 'react';

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
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/get-visits?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
      const data: Visit[] = await res.json();
      setVisits(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const dateOptions = [
    { label: 'Today', range: [new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]] },
    {
      label: 'Yesterday',
      range: (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const y = d.toISOString().split('T')[0];
        return [y, y];
      })(),
    },
    { label: 'Last 7 Days', range: [new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]] },
    { label: 'All Time', range: [null, null] },
  ];

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '1rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Site Visits</h1>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {dateOptions.map(({ label, range }) => (
          <button
            key={label}
            onClick={() => {
              setStartDate(range[0]);
              setEndDate(range[1]);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && visits.length === 0 && <p>No visits found.</p>}

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '1rem',
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Timestamp</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>URL</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>IP</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>User Agent</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Country</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>User</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit, i) => {
            const isUnique = visits.findIndex((v) => v.ip === visit.ip) === i;
            return (
              <tr
                key={visit.id}
                style={{
                  backgroundColor: i % 2 === 0 ? '#ffffff' : '#ddeeff',
                  fontWeight: isUnique ? '600' : '400',
                  color: '#111',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#cce0ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ffffff' : '#ddeeff';
                }}
              >
                <td style={{ padding: '8px' }}>{new Date(visit.timestamp).toLocaleString()}</td>
                <td style={{ padding: '8px' }}>{visit.url}</td>
                <td style={{ padding: '8px' }}>{visit.ip}</td>
                <td style={{ padding: '8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {visit.user_agent}
                </td>
                <td style={{ padding: '8px' }}>{visit.country ?? '-'}</td>
                <td style={{ padding: '8px' }}>{visit.user_id ? `User ${visit.user_id}` : 'Guest'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
