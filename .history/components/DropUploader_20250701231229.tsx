// components/DropUploader.tsx
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type DropUploaderProps = {
  label?: string;
  value?: string | null;
  onFile?: (file: File, previewUrl: string) => void;
  accept?: string;
  fieldType?: "image" | "video";
};

export default function DropUploader({
  label,
  value,
  onFile,
  accept = "image/*,video/*",
  fieldType = "image",
}: DropUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      onFile?.(file, url);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    capture: fieldType === "image" || fieldType === "video" ? "environment" : undefined,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #0af",
        borderRadius: 12,
        background: "#232940",
        color: "#fff",
        textAlign: "center",
        cursor: "pointer",
        padding: 18,
        marginBottom: 12,
        minHeight: 80,
      }}
    >
      <input {...getInputProps()} />
      {label && <div style={{ fontWeight: 700 }}>{label}</div>}
      {value ? (
        fieldType === "image" ? (
          <img
            src={value}
            alt="Preview"
            style={{ width: "100%", maxHeight: 120, objectFit: "contain", borderRadius: 8, marginTop: 10 }}
          />
        ) : (
          <video
            src={value}
            controls
            style={{ width: "100%", maxHeight: 120, borderRadius: 8, marginTop: 10 }}
          />
        )
      ) : isDragActive ? (
        <span>Drop your file here...</span>
      ) : (
        <span>
          {fieldType === "image"
            ? "Drag & drop or tap to select an image (camera/gallery)"
            : "Drag & drop or tap to select a video"}
        </span>
      )}
    </div>
  );
}
