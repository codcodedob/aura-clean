// /pages/admin/fam-awards.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FamAwardsAdmin() {
  const [fields, setFields] = useState({
    award_name: '',
    year: '',
    winner_name: '',
    video_url: '',
    image_url: '',
    description: ''
  });
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('fam_awards').insert([{
      ...fields, year: Number(fields.year)
    }])
    setMessage(error ? error.message : 'Award added!')
    if (!error) setFields({ award_name: '', year: '', winner_name: '', video_url: '', image_url: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '2rem auto', background: '#202030', padding: 20, borderRadius: 14 }}>
      <h2 style={{ color: '#0af' }}>Add FAM Award</h2>
      {['award_name', 'year', 'winner_name', 'video_url', 'image_url', 'description'].map(key =>
        <input
          key={key}
          placeholder={key.replace('_', ' ').toUpperCase()}
          value={fields[key as keyof typeof fields]}
          type={key === 'year' ? 'number' : 'text'}
          onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
          required={['award_name', 'year', 'winner_name'].includes(key)}
        />
      )}
      <button style={{ width: '100%', padding: 10, background: '#0af', color: '#fff', borderRadius: 8 }}>Add Award</button>
      {message && <div style={{ color: message.startsWith('Award') ? '#0af' : 'tomato', marginTop: 10 }}>{message}</div>}
    </form>
  )
}
