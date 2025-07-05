// components/AdminAuditTrailPanel.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  changed_by: string;
  changed_at: string;
  old_data: Record<string, any>;
  new_data: Record<string, any>;
}

export default function AdminAuditTrailPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from<AuditLog>('audit_logs')
      .select('*')
      .order('changed_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setLogs(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading audit trail…</p>;

  return (
    <section style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: 24 }}>
      <h2 style={{ marginBottom: 12, fontSize: '1.25rem' }}>Audit Trail</h2>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Time','User','Table','Op','Record','Old → New'].map(h => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td style={{ padding: 8 }}>{new Date(l.changed_at).toLocaleString()}</td>
                <td style={{ padding: 8, fontFamily: 'monospace' }}>{l.changed_by.slice(0,8)}</td>
                <td style={{ padding: 8 }}>{l.table_name}</td>
                <td style={{ padding: 8, fontWeight: 'bold' }}>{l.operation}</td>
                <td style={{ padding: 8 }}>{l.record_id}</td>
                <td style={{ padding: 8, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <div>🗎 {JSON.stringify(l.old_data)}</div>
                  <div>🗎 {JSON.stringify(l.new_data)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
