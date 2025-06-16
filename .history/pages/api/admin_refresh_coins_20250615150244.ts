// pages/api/admin_refresh_coins.ts
export default async function handler(req, res) {
  const result = await fetch('https://<ofhpjvbmrfwbmboxibur>.functions.supabase.co/admin_refresh_coins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  })

  const text = await result.text()
  res.status(result.status).send(text)
}
