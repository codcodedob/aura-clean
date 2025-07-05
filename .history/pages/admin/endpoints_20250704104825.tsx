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
    revalidate: 60, // Re-generate at most once per minute
  };
};

export default function EndpointsPage({ endpoints, scannedAt }: EndpointsPageProps) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Network Endpoints (scanned at {new Date(scannedAt).toLocaleString()})</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['IP', 'Hostname', 'Ports', 'Last Seen'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ccc' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {endpoints.map((e) => (
            <tr key={e.ip}>
              <td style={{ padding: 8 }}>{e.ip}</td>
              <td style={{ padding: 8 }}>{e.hostname ?? '—'}</td>
              <td style={{ padding: 8 }}>{e.open_tcp_ports.join(', ')}</td>
              <td style={{ padding: 8 }}>{new Date(e.last_seen).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
