import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/supabase";

type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

export default function AdminAuditTrailPanel() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("audit_logs")
      .select("*")
      .order("changed_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setLogs(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading audit trail…</p>;

  return (
    <section>
      <h2>Audit Trail</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Table</th>
            <th>Op</th>
            <th>Record</th>
            <th>Old → New</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.changed_at).toLocaleString()}</td>
              <td>{l.changed_by}</td>
              <td>{l.table_name}</td>
              <td>{l.operation}</td>
              <td>{l.record_id}</td>
              <td>
                <div>{JSON.stringify(l.old_data)}</div>
                <div>{JSON.stringify(l.new_data)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
