// components/AdminSLAPanel.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type Vulnerability = {
  id: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  discovered_at: string
  patched_at: string | null
}

export default function AdminSLAPanel() {
  const [vulns, setVulns] = useState<Vulnerability[]>([])

  useEffect(() => {
    // Assumes you have a `vulnerabilities` table with those fields
    supabase
      .from<Vulnerability>('vulnerabilities')
      .select('*')
      .order('discovered_at', { ascending: false })
      .then(({ data }) => {
        if (data) setVulns(data)
      })
  }, [])

  const now = Date.now()
  const compliance = (severity: Vulnerability['severity']) => {
    const tier = {
      Critical: 24 * 3600 * 1000,
      High: 72 * 3600 * 1000,
      Medium: 7 * 24 * 3600 * 1000,
      Low: 30 * 24 * 3600 * 1000,
    }[severity]
    const list = vulns.filter(v => v.severity === severity)
    if (!list.length) return 100
    const ok = list.filter(v => {
      const discovered = new Date(v.discovered_at).getTime()
      const patched = v.patched_at ? new Date(v.patched_at).getTime() : now
      return patched - discovered <= tier
    }).length
    return Math.round((ok / list.length) * 100)
  }

  return (
    <Card className="space-y-4">
      <CardHeader title="Vulnerability SLA Compliance" />
      <CardContent>
        {(['Critical','High','Medium','Low'] as Vulnerability['severity'][]).map(sev => (
          <div key={sev} className="flex justify-between">
            <span>{sev}</span>
            <span>{compliance(sev)}%</span>
          </div>
        ))}
        <div className="mt-4 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
