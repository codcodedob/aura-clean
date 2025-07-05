import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Define a proper type for SLA data
interface SLAData {
  vulnerability_scans: boolean
  endpoint_security_agents: boolean
  updated_at?: string
}

export default function AdminSLAPanel() {
  // Typed state
  const [slaData, setSlaData] = useState<SLAData>({
    vulnerability_scans: false,
    endpoint_security_agents: false,
    updated_at: undefined
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const recordId = 'global' // singleton record identifier

  useEffect(() => {
    const load = async () => {
      // Fetch existing SLA record
      const { data, error } = await supabase
        .from('sla_compliance')
        .select('*')
        .eq('id', recordId)
        .single()

      if (error) {
        // If not found, just stop loading
        console.error('Error loading SLA:', error)
      } else if (data) {
        const { vulnerability_scans, endpoint_security_agents, updated_at } = data as SLAData & { id: string }
        setSlaData({ vulnerability_scans, endpoint_security_agents, updated_at })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      id: recordId,
      vulnerability_scans: slaData.vulnerability_scans,
      endpoint_security_agents: slaData.endpoint_security_agents
    }
    const { error } = await supabase
      .from('sla_compliance')
      .upsert(payload, { onConflict: 'id' })

    setSaving(false)
    if (error) {
      console.error('SLA save error:', error)
      return
    }

    const now = new Date().toISOString()
    setSlaData((prev: SLAData) => ({
      ...prev,
      updated_at: now
    }))
  }

  if (loading) return <p>Loading SLA Data…</p>

  return (
    <section className="sla-panel" style={{ background: '#f3f4f6', padding: 16, borderRadius: 8 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>SLA Compliance</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={slaData.vulnerability_scans}
            onChange={e => setSlaData(prev => ({ ...prev, vulnerability_scans: e.target.checked }))}
          />
          Perform regular vulnerability scans on employee/contractor and production assets
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={slaData.endpoint_security_agents}
            onChange={e => setSlaData(prev => ({ ...prev, endpoint_security_agents: e.target.checked }))}
          />
          Use endpoint security agents to protect against malware and threats
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 16,
          padding: '8px 16px',
          background: saving ? '#ccc' : '#10B981',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? 'Saving…' : 'Save SLA'}
      </button>
      {slaData.updated_at && (
        <p style={{ marginTop: 8, fontSize: '0.875rem', color: '#555' }}>
          Last updated: {new Date(slaData.updated_at).toLocaleString()}
        </p>
      )}
    </section>
  )
}
