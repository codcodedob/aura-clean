// pages/api/trigger-scan.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { exec } from 'child_process'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  exec('python scripts/scan_vulnerabilities.py', (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr })
    res.status(200).json({ message: 'Scan started', output: stdout })
  })
}
