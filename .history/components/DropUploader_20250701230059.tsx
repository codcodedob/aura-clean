// components/DropUploader.tsx
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabaseClient";

interface DropUploaderProps {
  department: string;
  slot: number;
  field: "img_url" | "video_url";
  currentUrl?: string;
  onUploaded: (url: string) => void;
}

export default function DropUploader({
  department,
  slot,
  field,
  currentUrl,
  onUploaded,
}: DropUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      try {
        const file = acceptedFiles[0];
        const ext = file.name.split('.').pop();
        const path = `${department}/${slot}/${field}-${Date.now()}.${ext}`;
        const { data, error: uploadError } = await supabase.storage
          .from("department-media")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: true,
          });
        if (uploadError) throw uploadError;
        const publicUrl =
          supabase.storage.from("department-media").getPublicUrl(path).data
            .publicUrl;
        onUploaded(publicUrl);
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [department, slot, field, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      field === "img_url"
        ? { "image/*": [] }
        : { "video/*": [] },
    multiple: false,
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} style={{
      border: "2px dashed #0af",
      borderRadius: 8,
      padding: 14,
      textAlign: "center",
      background: "#181f2b",
      color: "#fff",
      marginBottom: 12,
      cursor: "pointer"
    }}>
      <input {...getInputProps()} capture={field === "img_url" ? "environment" : undefined} />
      {uploading
        ? <div>Uploading...</div>
        : (
          <div>
            {isDragActive ? (
              <div>Drop the file here...</div>
            ) : (
              <div>
                <div>
                  {field === "img_url" ? "Click or drag to upload/select image" : "Click or drag to upload/select video"}
                </div>
                {currentUrl &&
                  (field === "img_url"
                    ? <img src={currentUrl} style={{ maxWidth: 110, marginTop: 7, borderRadius: 4 }} />
                    : <video src={currentUrl} style={{ maxWidth: 110, marginTop: 7, borderRadius: 4 }} controls />)
                }
              </div>
            )}
          </div>
        )}
      {error && <div style={{ color: "salmon", fontSize: 13 }}>{error}</div>}
    </div>
  );
}
