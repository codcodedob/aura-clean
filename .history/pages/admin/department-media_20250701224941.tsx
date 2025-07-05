// pages/admin/department-media.tsx
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useDropzone } from "react-dropzone";

const DEPARTMENTS = [
  { key: "art", label: "Art" },
  { key: "business", label: "Business Options" },
  { key: "agx", label: "AGX" },
  { key: "communication", label: "Communication" },
];
const SLOTS = [1, 2, 3, 4];

export default function DepartmentMediaAdmin() {
  const [media, setMedia] = useState<any[]>([]);
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const [form, setForm] = useState<any>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("department_media").select("*");
      setMedia(data || []);
    })();
  }, []);

  const getSlot = (department: string, slot: number) =>
    media.find((m) => m.department === department && m.slot === slot);

  const handleEdit = (department: string, slot: number) => {
    const key = `${department}_${slot}`;
    setEditing((e) => ({ ...e, [key]: true }));
    const entry = getSlot(department, slot);
    setForm((f) => ({
      ...f,
      [key]: {
        title: entry?.title || "",
        description: entry?.description || "",
        img_url: entry?.img_url || "",
        video_url: entry?.video_url || "",
        link_url: entry?.link_url || "",
      },
    }));
  };

  const handleChange = (key: string, field: string, value: string) => {
    setForm((f) => ({
      ...f,
      [key]: {
        ...f[key],
        [field]: value,
      },
    }));
  };

  const handleUpload = useCallback(
    async (department: string, slot: number, file: File, type: "img_url" | "video_url") => {
      const key = `${department}_${slot}`;
      setUploading((u) => ({ ...u, [key]: true }));
      const ext = file.name.split(".").pop();
      const filename = `${department}_${slot}_${Date.now()}.${ext}`;
      const path = `${type === "img_url" ? "media-imgs" : "media-videos"}/${filename}`;
      let uploadRes;
      if (type === "img_url") {
        uploadRes = await supabase.storage.from("public").upload(path, file, { cacheControl: "3600", upsert: true });
      } else {
        uploadRes = await supabase.storage.from("public").upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
      }
      if (uploadRes.error) {
        alert("Failed upload: " + uploadRes.error.message);
      } else {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public/${path}`;
        setForm((f) => ({
          ...f,
          [key]: {
            ...f[key],
            [type]: url,
          },
        }));
      }
      setUploading((u) => ({ ...u, [key]: false }));
    },
    []
  );

  const handleSave = async (department: string, slot: number) => {
    const key = `${department}_${slot}`;
    const values = form[key];
    let id = getSlot(department, slot)?.id;
    if (id) {
      await supabase.from("department_media").update(values).eq("id", id);
    } else {
      await supabase.from("department_media").insert([{ department, slot, ...values }]);
    }
    const { data } = await supabase.from("department_media").select("*");
    setMedia(data || []);
    setEditing((e) => ({ ...e, [key]: false }));
  };

  // --- Dropzone Component for each image/video field ---
  function DropUploader({
    department,
    slot,
    field,
    accept,
    preview,
  }: {
    department: string;
    slot: number;
    field: "img_url" | "video_url";
    accept: string;
    preview: string;
  }) {
    const key = `${department}_${slot}`;
    const onDrop = useCallback(
      (accepted: File[]) => {
        if (accepted && accepted[0]) {
          handleUpload(department, slot, accepted[0], field);
        }
      },
      [department, slot, field]
    );
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { "image/*": field === "img_url", "video/*": field === "video_url" },
      maxFiles: 1,
    });
    return (
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #0af",
          borderRadius: 10,
          padding: 12,
          background: "#20242a",
          cursor: "pointer",
          marginBottom: 7,
        }}
      >
        <input {...getInputProps()} />
        {uploading[key] ? (
          <span>Uploading...</span>
        ) : preview ? (
          field === "img_url" ? (
            <img src={preview} alt="" style={{ width: "100%", borderRadius: 8 }} />
          ) : (
            <video src={preview} controls style={{ width: "100%", borderRadius: 8, background: "#222" }} />
          )
        ) : isDragActive ? (
          <span>Drop {field === "img_url" ? "image" : "video"} here...</span>
        ) : (
          <span>Drag & drop {field === "img_url" ? "image" : "video"}, or click to select</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 40, background: "#181a1f", minHeight: "100vh", color: "#fff" }}>
      <h1>Department Carousel Media Editor</h1>
      {DEPARTMENTS.map((dept) => (
        <div key={dept.key} style={{ marginBottom: 42 }}>
          <h2 style={{ color: "#0af" }}>{dept.label}</h2>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {SLOTS.map((slot) => {
              const key = `${dept.key}_${slot}`;
              const entry = getSlot(dept.key, slot);
              return (
                <div key={slot} style={{ background: "#252630", borderRadius: 16, padding: 22, width: 260 }}>
                  {editing[key] ? (
                    <>
                      <input
                        value={form[key]?.title || ""}
                        onChange={(e) => handleChange(key, "title", e.target.value)}
                        placeholder="Title"
                        style={{ width: "100%", marginBottom: 7 }}
                      />
                      <input
                        value={form[key]?.description || ""}
                        onChange={(e) => handleChange(key, "description", e.target.value)}
                        placeholder="Description"
                        style={{ width: "100%", marginBottom: 7 }}
                      />
                      <DropUploader
                        department={dept.key}
                        slot={slot}
                        field="img_url"
                        accept="image/*"
                        preview={form[key]?.img_url || ""}
                      />
                      <DropUploader
                        department={dept.key}
                        slot={slot}
                        field="video_url"
                        accept="video/*"
                        preview={form[key]?.video_url || ""}
                      />
                      <input
                        value={form[key]?.link_url || ""}
                        onChange={(e) => handleChange(key, "link_url", e.target.value)}
                        placeholder="Link URL"
                        style={{ width: "100%", marginBottom: 7 }}
                      />
                      <button
                        onClick={() => handleSave(dept.key, slot)}
                        style={{
                          background: "#0af",
                          color: "#111",
                          fontWeight: 600,
                          borderRadius: 8,
                          padding: "8px 20px",
                          marginTop: 5,
                        }}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>
                        {entry?.title || <span style={{ color: "#888" }}>— Empty —</span>}
                      </div>
                      <div style={{ fontSize: 13, margin: "8px 0", minHeight: 32 }}>{entry?.description}</div>
                      {entry?.img_url && (
                        <img src={entry.img_url} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 8 }} />
                      )}
                      {entry?.video_url && (
                        <video src={entry.video_url} controls style={{ width: "100%", borderRadius: 12, marginBottom: 8 }} />
                      )}
                      <div style={{ fontSize: 12, color: "#ccc" }}>{entry?.link_url}</div>
                      <button
                        onClick={() => handleEdit(dept.key, slot)}
                        style={{
                          background: "#111",
                          color: "#0af",
                          fontWeight: 600,
                          borderRadius: 6,
                          padding: "6px 16px",
                          marginTop: 8,
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
