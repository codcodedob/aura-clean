// /components/DropUploader.tsx
import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { supabase } from "@/lib/supabaseClient"

interface DropUploaderProps {
  fileUrl: string | null
  onUpload: (url: string) => void
  folder: string // E.g. 'department-media/art/1'
  accept?: string // E.g. 'image/*,video/*'
  label?: string
}

export default function DropUploader({
  fileUrl,
  onUpload,
  folder,
  accept = "image/*,video/*",
  label = "Upload Media"
}: DropUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    if (!acceptedFiles.length) return
    const file = acceptedFiles[0]
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const newFilename = `${folder}/${Date.now()}.${ext}`
      const { data, error: uploadErr } = await supabase
        .storage
        .from("public-media")
        .upload(newFilename, file, { upsert: true })

      if (uploadErr) throw uploadErr

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from("public-media")
        .getPublicUrl(newFilename)
      const publicUrl = urlData?.publicUrl
      if (publicUrl) onUpload(publicUrl)
    } catch (err: any) {
      setError(err.message || "Upload failed.")
    }
    setUploading(false)
  }, [folder, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxFiles: 1,
    // mobile camera enabled by default for "image/*" or "video/*"
  })

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #0af",
        borderRadius: 12,
        padding: 20,
        textAlign: "center",
        background: "#12192a",
        cursor: "pointer",
        marginBottom: 14
      }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div>Uploading…</div>
      ) : fileUrl ? (
        <div style={{ marginBottom: 8 }}>
          {accept.includes("image") && fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img src={fileUrl} style={{ maxWidth: 160, maxHeight: 100, borderRadius: 8, margin: "0 auto" }} alt="preview" />
          ) : accept.includes("video") && fileUrl.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={fileUrl} controls style={{ maxWidth: 180, borderRadius: 8 }} />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a>
          )}
        </div>
      ) : (
        <div style={{ color: "#0af" }}>
          {isDragActive ? "Drop the file here…" : label}
          <br />
          <span style={{ color: "#ccc", fontSize: 13 }}>
            (Drag & drop, or tap to select from your device/camera)
          </span>
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 6 }}>{error}</div>}
    </div>
  )
}
