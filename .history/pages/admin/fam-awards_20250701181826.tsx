// pages/admin/fam-awards.tsx

import React, { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { supabase } from "@/lib/supabaseClient"

function FileUploader({
  label,
  accept,
  bucket,
  onUpload,
  value
}: {
  label: string
  accept: Record<string, string[]>
  bucket: string
  onUpload: (url: string) => void
  value?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      setUploading(true)
      setError(null)
      const ext = file.name.split(".").pop()
      const path = `fam-awards/${Date.now()}-${Math.random()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file)
      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      if (data?.publicUrl) onUpload(data.publicUrl)
      setUploading(false)
    },
    [bucket, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1
  })

  return (
    <div>
      <label style={{ fontWeight: 700, marginBottom: 8, display: "block" }}>{label}</label>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #0af",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          cursor: "pointer",
          background: isDragActive ? "#181825" : "#232433",
          color: "#fff",
          marginBottom: 12
        }}
      >
        <input {...getInputProps()} />
        {uploading
          ? "Uploading..."
          : isDragActive
          ? "Drop the file here..."
          : "Drag & drop here, or click to select"}
        {error && <div style={{ color: "#f55", marginTop: 8 }}>{error}</div>}
      </div>
      {value && (
        <>
          {accept["image/*"] ? (
            <img src={value} style={{ maxWidth: 320, borderRadius: 8, margin: "8px auto" }} />
          ) : null}
          {accept["video/mp4"] ? (
            <video src={value} style={{ maxWidth: 320, borderRadius: 8, margin: "8px auto" }} controls />
          ) : null}
        </>
      )}
    </div>
  )
}

export default function FamAwardsAdmin() {
  const [form, setForm] = useState({
    award_name: "",
    winner_name: "",
    year: "",
    description: "",
    image_url: "",
    video_url: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from("fam_awards").insert([form])
    setSuccess(!error)
    setSubmitting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 520,
        margin: "32px auto",
        background: "#181825",
        padding: 32,
        borderRadius: 16,
        color: "#fff",
        boxShadow: "0 0 24px #0af5"
      }}
    >
      <h2 style={{ fontWeight: 800, marginBottom: 18 }}>New FAM Award</h2>
      <FileUploader
        label="Award Image"
        accept={{ "image/*": [] }}
        bucket="public"
        value={form.image_url}
        onUpload={(url) => setForm((f) => ({ ...f, image_url: url }))}
      />
      <FileUploader
        label="Award Video (optional)"
        accept={{ "video/mp4": [] }}
        bucket="public"
        value={form.video_url}
        onUpload={(url) => setForm((f) => ({ ...f, video_url: url }))}
      />
      <input
        name="award_name"
        placeholder="Award Name"
        value={form.award_name}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8 }}
        required
      />
      <input
        name="winner_name"
        placeholder="Winner Name"
        value={form.winner_name}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8 }}
        required
      />
      <input
        name="year"
        placeholder="Award Year"
        value={form.year}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8 }}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, minHeight: 80 }}
      />
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: "#0af",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
          fontWeight: 700,
          marginTop: 10
        }}
      >
        {submitting ? "Submitting..." : "Add Award"}
      </button>
      {success && (
        <div style={{ color: "#0af", marginTop: 16, fontWeight: 600 }}>
          Award added!
        </div>
      )}
    </form>
  )
}
