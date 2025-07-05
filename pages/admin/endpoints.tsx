// pages/admin/endpoints.tsx
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import { GetStaticProps } from 'next';

// Define the shape of a network endpoint
interface Endpoint {
  ip: string;
  hostname?: string;
  open_tcp_ports: number[];
  last_seen: string;
}

interface EndpointsPageProps {
  endpoints: Endpoint[];
  scannedAt: string;
}

export const getStaticProps: GetStaticProps<EndpointsPageProps> = async () => {
  const file = path.join(process.cwd(), 'config/networkEndpoints.json');
  const json = JSON.parse(await fs.readFile(file, 'utf8')) as {
    endpoints: Endpoint[];
    scanned_at: string;
  };

  return {
    props: {
      endpoints: json.endpoints,
      scannedAt: json.scanned_at,
    },
    revalidate: 60, // Refresh every minute
  };
};

export default function EndpointsPage({ endpoints, scannedAt }: EndpointsPageProps) {
  return (
    <div style={{ background: '#1e1e2f', minHeight: '100vh', color: '#e0e0e0', padding: '24px 32px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Network Endpoints</h1>
        <small style={{ opacity: 0.7 }}>Scanned at {new Date(scannedAt).toLocaleString()}</small>
      </header>

      <div style={{ overflowX: 'auto', background: '#2a2a3d', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#34344e' }}>
              {['IP Address', 'Hostname', 'Open Ports', 'Last Seen'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #444' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e, idx) => (
              <tr
                key={e.ip}
                style={{
                  background: idx % 2 === 0 ? '#2a2a3d' : '#23232d',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#3b3b5a')}
                onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#2a2a3d' : '#23232d')}
              >
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{e.ip}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#aaa' }}>{e.hostname || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{e.open_tcp_ports.join(', ') || 'None'}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#aaa' }}>{new Date(e.last_seen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
