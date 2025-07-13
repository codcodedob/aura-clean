import React, { useEffect, useState, ChangeEvent } from 'react';

type Visit = {
  id: string;
  timestamp: string;
  url: string;
  ip: string;
  user_agent: string;
  country?: string;
};

export default function AdminSiteVisitsPanel() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'url' | 'ip'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    try {
      const res = await fetch(`/api/get-visits?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
      const data: Visit[] = await res.json();
      setVisits(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [startDate, endDate, sortBy, sortOrder]);

  const exportCSV = () => {
    if (!visits.length) return;
    const headers = Object.keys(visits[0]);
    const csvRows = [
      headers.join(','),
      ...visits.map(v =>
        headers.map(h => `"${String(v[h as keyof Visit] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site_visits_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSortByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'timestamp' | 'url' | 'ip');
  };

  const handleSortOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
  };

  return (
    <div
      style={{
        background: '#1f2937',
        borderRadius: 16,
        padding: 24,
        marginTop: 36,
        color: '#fff',
        boxShadow: '0 4px 32px rgba(10, 175, 255, 0.2)',
      }}
    >
      <h3 style={{ color: '#0af', fontWeight: '700', marginBottom: 12 }}>
        Recent Site Visits
      </h3>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          Sort By:
          <select
            value={sortBy}
            onChange={handleSortByChange}
            style={{ marginLeft: 8 }}
          >
            <option value="timestamp">Timestamp</option>
            <option value="url">URL</option>
            <option value="ip">IP</option>
          </select>
        </label>

        <label>
          Order:
          <select
            value={sortOrder}
            onChange={handleSortOrderChange}
            style={{ marginLeft: 8 }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <button
          onClick={exportCSV}
          style={{
            backgroundColor: '#0af',
            color: '#000',
            padding: '8px 16px',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Export CSV
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fff',
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Timestamp</th>
              <th style={{ textAlign: 'left', padding: 8 }}>URL</th>
              <th style={{ textAlign: 'left', padding: 8 }}>IP</th>
              <th style={{ textAlign: 'left', padding: 8 }}>User Agent</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Country</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    padding: 16,
                    color: '#888',
                  }}
                >
                  No visits found.
                </td>
              </tr>
            ) : (
              visits.map(visit => (
                <tr
                  key={visit.id}
                  style={{ borderBottom: '1px solid #2e3a4e' }}
                >
                  <td style={{ padding: 8 }}>
                    {new Date(visit.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: 8 }}>{visit.url}</td>
                  <td style={{ padding: 8 }}>{visit.ip}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>
                    {visit.user_agent}
                  </td>
                  <td style={{ padding: 8 }}>
                    {visit.country || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
