// pages/admin/department-media.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import DropUploader from "@/components/DropUploader";

const DEPARTMENTS = [
  { key: "art", label: "Art Department" },
  { key: "business", label: "Business Options" },
  { key: "agx", label: "AGX" },
  { key: "communication", label: "Communication" }
];

const SLOTS = [1, 2, 3, 4];

export default function DepartmentMediaAdmin() {
  const [media, setMedia] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("department_media").select("*");
      // index by `${department}-${slot}`
      const mapped: Record<string, any> = {};
      (data || []).forEach((item: any) => {
        mapped[`${item.department}-${item.slot}`] = item;
      });
      setMedia(mapped);
      setLoading(false);
    })();
  }, []);

  async function handleUpdate(department: string, slot: number, field: "img_url" | "video_url", value: string) {
    setSaving(true);
    setMessage(null);
    const key = `${department}-${slot}`;
    // Upsert logic
    const existing = media[key];
    let { data, error } = await supabase
      .from("department_media")
      .upsert({
        id: existing?.id,
        department,
        slot,
        title: existing?.title || "",
        description: existing?.description || "",
        img_url: field === "img_url" ? value : existing?.img_url,
        video_url: field === "video_url" ? value : existing?.video_url,
        link_url: existing?.link_url || ""
      }, { onConflict: ['department', 'slot'] })
      .select().single();

    if (!error) {
      setMedia((m) => ({
        ...m,
        [key]: { ...(m[key] || {}), ...data }
      }));
      setMessage("Updated!");
    } else {
      setMessage(error.message);
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 2000);
  }

  async function handleTextUpdate(department: string, slot: number, field: string, value: string) {
    const key = `${department}-${slot}`;
    const existing = media[key];
    let { data, error } = await supabase
      .from("department_media")
      .upsert({
        id: existing?.id,
        department,
        slot,
        title: field === "title" ? value : existing?.title || "",
        description: field === "description" ? value : existing?.description || "",
        img_url: existing?.img_url,
        video_url: existing?.video_url,
        link_url: field === "link_url" ? value : existing?.link_url || ""
      }, { onConflict: ['department', 'slot'] })
      .select().single();
    if (!error) {
      setMedia((m) => ({
        ...m,
        [key]: { ...(m[key] || {}), ...data }
      }));
    }
  }

  return (
    <div style={{ maxWidth: 1050, margin: "32px auto", padding: 32 }}>
      <h2 style={{ marginBottom: 28 }}>Department Media Admin</h2>
      {loading && <div>Loading...</div>}
      {message && <div style={{ color: "#0af", marginBottom: 10 }}>{message}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
        {DEPARTMENTS.map((dept) => (
          <div key={dept.key} style={{
            background: "#181f2b",
            borderRadius: 14,
            boxShadow: "0 2px 14px #0af2",
            padding: 20,
            flex: "1 1 400px",
            minWidth: 370
          }}>
            <h3 style={{ marginBottom: 13 }}>{dept.label}</h3>
            {SLOTS.map((slot) => {
              const key = `${dept.key}-${slot}`;
              const m = media[key] || {};
              return (
                <div key={key} style={{
                  marginBottom: 22,
                  background: "#23273c",
                  borderRadius: 9,
                  padding: "13px 12px"
                }}>
                  <div style={{ marginBottom: 5, fontWeight: 600 }}>Slot {slot}</div>
                  <DropUploader
                    department={dept.key}
                    slot={slot}
                    field="img_url"
                    currentUrl={m.img_url}
                    onUploaded={url => handleUpdate(dept.key, slot, "img_url", url)}
                  />
                  <DropUploader
                    department={dept.key}
                    slot={slot}
                    field="video_url"
                    currentUrl={m.video_url}
                    onUploaded={url => handleUpdate(dept.key, slot, "video_url", url)}
                  />
                  <input
                    style={{ marginTop: 7, padding: 7, width: "100%", borderRadius: 4, marginBottom: 3 }}
                    placeholder="Title"
                    value={m.title || ""}
                    onChange={e => handleTextUpdate(dept.key, slot, "title", e.target.value)}
                  />
                  <input
                    style={{ marginTop: 2, padding: 7, width: "100%", borderRadius: 4, marginBottom: 3 }}
                    placeholder="Description"
                    value={m.description || ""}
                    onChange={e => handleTextUpdate(dept.key, slot, "description", e.target.value)}
                  />
                  <input
                    style={{ marginTop: 2, padding: 7, width: "100%", borderRadius: 4 }}
                    placeholder="Link URL"
                    value={m.link_url || ""}
                    onChange={e => handleTextUpdate(dept.key, slot, "link_url", e.target.value)}
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
