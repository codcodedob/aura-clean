// pages/admin/department-media.tsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

const DEPARTMENTS = [
  { key: "art", label: "Art Department" },
  { key: "business", label: "Business Options" },
  { key: "agx", label: "AGX" },
  { key: "communication", label: "Communication" }
];
const SLOTS = [1, 2, 3, 4];

type MediaEntry = {
  id: string;
  department: string;
  slot: number;
  title: string;
  description?: string;
  img_url?: string;
  video_url?: string;
  link_url?: string;
  updated_at?: string;
};

export default function AdminDepartmentMedia() {
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<{ [k: string]: boolean }>({});

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    const { data, error } = await supabase
      .from<MediaEntry>("department_media")
      .select("*")
      .order("department")
      .order("slot");
    if (error) {
      alert("Error loading media: " + error.message);
      setMedia([]);
    } else {
      setMedia(data || []);
    }
    setLoading(false);
  }

  async function updateField(id: string, field: keyof MediaEntry, value: any) {
    setSaving(true);
    const { error } = await supabase
      .from("department_media")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      alert("Save failed: " + error.message);
    } else {
      fetchMedia();
      setEdit(ed => ({ ...ed, [id + '-' + field]: false }));
    }
    setSaving(false);
  }

  async function uploadMedia(id: string, field: "img_url" | "video_url", file: File) {
    setSaving(true);
    const filePath = `media/${id}/${field}-${file.name.replace(/\s+/g, "")}`;
    const { error: uploadError } = await supabase.storage.from("public").upload(filePath, file, { upsert: true });
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setSaving(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("public").getPublicUrl(filePath);
    const url = urlData.publicUrl;
    const { error } = await supabase
      .from("department_media")
      .update({ [field]: url, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) alert("Save failed: " + error.message);
    else fetchMedia();
    setSaving(false);
  }

  function RenderUploader({ id, field, current, accept }: { id: string; field: "img_url" | "video_url"; current?: string; accept: string }) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (!e.target.files?.length) return;
      uploadMedia(id, field, e.target.files[0]);
    }
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleChange}
          capture={field === "img_url" ? "environment" : undefined}
        />
        <button
          onClick={() => inputRef.current?.click()}
          style={{ marginBottom: 6, marginRight: 8, fontSize: 13 }}
        >
          {current ? "Replace" : "Upload"} {field === "img_url" ? "Image" : "Video"}
        </button>
        {current && (field === "img_url"
          ? <img src={current} style={{ width: 70, height: 44, objectFit: "cover", borderRadius: 6, border: "1px solid #ccc" }} alt="img" />
          : <video src={current} controls style={{ width: 80, height: 44, objectFit: "cover", borderRadius: 6 }} />
        )}
      </div>
    );
  }

  if (loading) return <div style={{ padding: 32 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 1060, margin: "40px auto", padding: 16 }}>
      <h1>Department Media Editor</h1>
      <p>Update the images, videos, and text for each business suite/department card. Changes are live!</p>
      {saving && <div style={{ color: "#36e", fontWeight: 700 }}>Saving…</div>}

      <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 26 }}>
        {DEPARTMENTS.map(dept => (
          <div key={dept.key} style={{ flex: "1 1 360px", minWidth: 340 }}>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>{dept.label}</h2>
            {SLOTS.map(slot => {
              const entry = media.find(m => m.department === dept.key && m.slot === slot)
                || ({ id: "new", department: dept.key, slot, title: "", description: "", img_url: "", video_url: "", link_url: "" } as MediaEntry);

              return (
                <div key={slot} style={{ marginBottom: 36, padding: 16, borderRadius: 16, border: "1px solid #ccc", background: "#f8fafd" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 9 }}>
                    <span style={{ fontSize: 19, fontWeight: 700, flex: 1 }}>Slot {slot}</span>
                    {entry.id !== "new" && <span style={{ fontSize: 13, color: "#bbb", marginLeft: 8 }}>{entry.updated_at?.slice(0, 10)}</span>}
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom: 7 }}>
                    <input
                      value={entry.title}
                      onChange={e => {
                        setMedia(m => m.map(n => n.id === entry.id ? { ...n, title: e.target.value } : n));
                        setEdit(ed => ({ ...ed, [entry.id + "-title"]: true }));
                      }}
                      placeholder="Title"
                      style={{ width: "100%", fontSize: 16, marginBottom: 4, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                    />
                    {edit[entry.id + "-title"] && (
                      <button onClick={() => updateField(entry.id, "title", entry.title)} disabled={saving} style={{ fontSize: 13 }}>Save</button>
                    )}
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: 7 }}>
                    <textarea
                      value={entry.description || ""}
                      onChange={e => {
                        setMedia(m => m.map(n => n.id === entry.id ? { ...n, description: e.target.value } : n));
                        setEdit(ed => ({ ...ed, [entry.id + "-description"]: true }));
                      }}
                      placeholder="Description"
                      rows={2}
                      style={{ width: "100%", fontSize: 15, marginBottom: 4, padding: 7, borderRadius: 6, border: "1px solid #ccc" }}
                    />
                    {edit[entry.id + "-description"] && (
                      <button onClick={() => updateField(entry.id, "description", entry.description)} disabled={saving} style={{ fontSize: 13 }}>Save</button>
                    )}
                  </div>

                  {/* Link URL */}
                  <div style={{ marginBottom: 7 }}>
                    <input
                      value={entry.link_url || ""}
                      onChange={e => {
                        setMedia(m => m.map(n => n.id === entry.id ? { ...n, link_url: e.target.value } : n));
                        setEdit(ed => ({ ...ed, [entry.id + "-link_url"]: true }));
                      }}
                      placeholder="Link URL"
                      style={{ width: "100%", fontSize: 15, marginBottom: 4, padding: 7, borderRadius: 6, border: "1px solid #ccc" }}
                    />
                    {edit[entry.id + "-link_url"] && (
                      <button onClick={() => updateField(entry.id, "link_url", entry.link_url)} disabled={saving} style={{ fontSize: 13 }}>Save</button>
                    )}
                  </div>

                  {/* Media Uploaders */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
                    <RenderUploader id={entry.id} field="img_url" current={entry.img_url} accept="image/*" />
                    <RenderUploader id={entry.id} field="video_url" current={entry.video_url} accept="video/*" />
                  </div>

                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
