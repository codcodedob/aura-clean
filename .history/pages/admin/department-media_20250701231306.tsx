// pages/admin/department-media.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import DropUploader from "@/components/DropUploader";

const DEPARTMENTS = [
  { key: "art", label: "Art Department" },
  { key: "business", label: "Business" },
  { key: "agx", label: "AGX" },
  { key: "communication", label: "Communication" },
  // Add more if needed
];

const SLOTS = [1, 2, 3, 4];

type MediaEntry = {
  id: string;
  department: string;
  slot: number;
  title: string;
  description: string;
  img_url?: string;
  video_url?: string;
  link_url?: string;
};

export default function DepartmentMediaAdmin() {
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch from Supabase on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("department")
        .order("slot");
      if (error) alert("Error loading: " + error.message);
      else setMedia(data as MediaEntry[]);
      setLoading(false);
    })();
  }, []);

  // Helper: update a single field
  async function updateMediaField(
    id: string,
    field: keyof MediaEntry,
    value: string
  ) {
    setMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
    const { error } = await supabase
      .from("department_media")
      .update({ [field]: value })
      .eq("id", id);
    if (error) alert("Failed to update: " + error.message);
  }

  // Handle file upload (image/video)
  async function handleFile(
    id: string,
    file: File,
    type: "img_url" | "video_url"
  ) {
    const ext = file.name.split(".").pop();
    const path = `department_media/${id}_${type}.${ext}`;
    let upload;
    if (type === "img_url") {
      upload = await supabase.storage.from("public").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
    } else {
      upload = await supabase.storage.from("public").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
    }
    if (upload.error) return alert("Upload failed: " + upload.error.message);
    // Get public URL:
    const { data: urlData } = supabase.storage
      .from("public")
      .getPublicUrl(path);
    if (urlData?.publicUrl) updateMediaField(id, type, urlData.publicUrl);
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Department Carousel Media Admin</h2>
      {loading && <div>Loading...</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.key}
            style={{
              background: "#1a2036",
              padding: 18,
              borderRadius: 18,
              flex: "1 1 360px",
              minWidth: 320,
            }}
          >
            <h3>{dept.label}</h3>
            {SLOTS.map((slot) => {
              const entry =
                media.find((m) => m.department === dept.key && m.slot === slot) ||
                ({
                  id: "",
                  department: dept.key,
                  slot,
                  title: "",
                  description: "",
                  img_url: "",
                  video_url: "",
                  link_url: "",
                } as MediaEntry);

              return (
                <div
                  key={slot}
                  style={{
                    background: "#252c45",
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>
                    Slot {slot}
                  </div>
                  <input
                    value={entry.title}
                    placeholder="Title"
                    style={{ width: "100%", marginBottom: 6, padding: 6 }}
                    onChange={(e) =>
                      updateMediaField(entry.id, "title", e.target.value)
                    }
                  />
                  <textarea
                    value={entry.description}
                    placeholder="Description"
                    rows={2}
                    style={{ width: "100%", marginBottom: 6, padding: 6 }}
                    onChange={(e) =>
                      updateMediaField(entry.id, "description", e.target.value)
                    }
                  />
                  <input
                    value={entry.link_url}
                    placeholder="Link URL"
                    style={{ width: "100%", marginBottom: 6, padding: 6 }}
                    onChange={(e) =>
                      updateMediaField(entry.id, "link_url", e.target.value)
                    }
                  />
                  <DropUploader
                    label="Image"
                    value={entry.img_url || ""}
                    fieldType="image"
                    onFile={(file) => handleFile(entry.id, file, "img_url")}
                  />
                  <DropUploader
                    label="Video"
                    value={entry.video_url || ""}
                    fieldType="video"
                    accept="video/*"
                    onFile={(file) => handleFile(entry.id, file, "video_url")}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
