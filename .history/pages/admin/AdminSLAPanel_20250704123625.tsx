import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminSLAPanel() {
  const [slaData, setSlaData] = useState<any>({
    vulnerability_scans: false,
    endpoint_security_agents: false,
    updated_at: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const userId = 'global' // singleton record identifier

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('sla_compliance')
        .select('*')
        .eq('id', userId)
        .single()
      if (error && error.code === 'PGRST116') {
        // no record yet
        setLoading(false)
      } else if (data) {
        setSlaData({
          vulnerability_scans: data.vulnerability_scans,
          endpoint_security_agents: data.endpoint_security_agents,
          updated_at: data.updated_at
        })
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      id: userId,
      vulnerability_scans: slaData.vulnerability_scans,
      endpoint_security_agents: slaData.endpoint_security_agents
    }
    const { error } = await supabase
      .from('sla_compliance')
      .upsert(payload, { onConflict: 'id' })
    setSaving(false)
    if (error) console.error('SLA save error:', error)
    else {
      const now = new Date().toISOString()
      setSlaData(prev => ({ ...prev, updated_at: now }))
    }
  }

  if (loading) return <p>Loading SLA Data…</p>

  return (
    <section className="sla-panel" style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
      <h2 className="text-xl font-semibold mb-4">SLA Compliance</h2>
      <div className="space-y-3">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={slaData.vulnerability_scans}
            onChange={e => setSlaData(prev => ({ ...prev, vulnerability_scans: e.target.checked }))}
          />
          Do you actively perform vulnerability scans against employee and contractor machines?
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={slaData.endpoint_security_agents}
            onChange={e => setSlaData(prev => ({ ...prev, endpoint_security_agents: e.target.checked }))}
          />
          Do you use endpoint security tools/agents to protect machines and production assets from malware?
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: '12px', padding: '8px 16px', background: saving ? '#ccc' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saving ? 'Saving…' : 'Save SLA'}
      </button>
      {slaData.updated_at && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Last updated: {new Date(slaData.updated_at).toLocaleString()}
        </p>
      )}
    </section>
  )
}
