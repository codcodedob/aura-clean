import React, { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { supabase } from "@/lib/supabaseClient"

export default function FamAwardsAdmin() {
  const [awards, setAwards] = useState<any[]>([])
  const [showPicks, setShowPicks] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', winner: '', year: '', description: '', image: null as File|null, video: null as File|null
  })

  // Fetch awards
  useEffect(() => {
    const fetchAwards = async () => {
      let { data, error } = await supabase
        .from('fam_awards')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setAwards(data!)
    }
    fetchAwards()
  }, [uploading])

  // Toggle picks
  const displayAwards = showPicks ? awards.filter(a => a.is_pick) : awards

  // Upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setForm(f => ({ ...f, image: acceptedFiles[0] }))
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false, accept: { 'image/*': [] } })

  // Upload to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    let image_url = '', video_url = ''
    if (form.image) {
      const { data, error } = await supabase.storage
        .from('fam-awards')
        .upload(`images/${Date.now()}_${form.image.name}`, form.image)
      if (!error) image_url = supabase.storage.from('fam-awards').getPublicUrl(data.path).publicUrl
    }
    // TODO: repeat for video if video file is present in form
    // Insert row
    await supabase.from('fam_awards').insert({
      name: form.name,
      winner: form.winner,
      description: form.description,
      year: Number(form.year),
      image_url,
      video_url
    })
    setUploading(false)
    setForm({ name: '', winner: '', year: '', description: '', image: null, video: null })
  }

  // Toggle Pick
  const handlePick = async (id: string, is_pick: boolean) => {
    await supabase.from('fam_awards').update({ is_pick: !is_pick }).eq('id', id)
    setUploading(u => !u) // Refresh
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>FAM Awards Admin</h1>
      {/* Upload Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div>
          <label>Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label>Winner</label>
          <input value={form.winner} onChange={e => setForm(f => ({ ...f, winner: e.target.value }))} required />
        </div>
        <div>
          <label>Year</label>
          <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        {/* Image Upload */}
        <div {...getRootProps()} style={{ border: "1px dashed #ccc", padding: 16, margin: "8px 0" }}>
          <input {...getInputProps()} />
          {form.image ? <img src={URL.createObjectURL(form.image)} alt="Preview" height={60} /> : "Drop image here or click to select"}
        </div>
        <button type="submit" disabled={uploading}>Submit</button>
      </form>
      {/* Toggle Picks */}
      <button onClick={() => setShowPicks(p => !p)} style={{ marginBottom: 20 }}>
        {showPicks ? "Show All Submissions" : "Show My Picks Only"}
      </button>
      {/* List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 24 }}>
        {displayAwards.map(a => (
          <div key={a.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 18, background: "#222", color: "#fff" }}>
            <img src={a.image_url} alt={a.name} style={{ width: 200, borderRadius: 8, marginBottom: 8 }} />
            <h3>{a.name}</h3>
            <div><b>Winner:</b> {a.winner}</div>
            <div><b>Year:</b> {a.year}</div>
            <div>{a.description}</div>
            <button onClick={() => handlePick(a.id, !!a.is_pick)} style={{ marginTop: 8 }}>
              {a.is_pick ? "Remove from Picks" : "Add to Picks"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
