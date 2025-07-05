import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DepartmentMediaCard {
  id: string;
  department: string;
  slot: number;
  title: string;
  description: string;
  img_url: string;
  link_url: string;
}

export default function DepartmentMediaManager() {
  const [media, setMedia] = useState<DepartmentMediaCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // id of card being edited
  const [form, setForm] = useState<Partial<DepartmentMediaCard>>({});

  // Load cards
  useEffect(() => {
    setLoading(true);
    supabase
      .from("department_media")
      .select("*")
      .order("department", { ascending: true })
      .order("slot", { ascending: true })
      .then(({ data }) => {
        setMedia(data || []);
        setLoading(false);
      });
  }, []);

  // Start editing a card
  function editCard(card: DepartmentMediaCard) {
    setEditing(card.id);
    setForm({ ...card });
  }

  // Save edits to Supabase
  async function saveCard() {
    setLoading(true);
    await supabase
      .from("department_media")
      .update({
        title: form.title,
        description: form.description,
        img_url: form.img_url,
        link_url: form.link_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", editing);

    // Refetch media
    const { data } = await supabase
      .from("department_media")
      .select("*")
      .order("department", { ascending: true })
      .order("slot", { ascending: true });
    setMedia(data || []);
    setEditing(null);
    setLoading(false);
  }

  return (
    <div style={{ padding: 32, maxWidth: 860, margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        Department Media Manager
      </h2>
      <p style={{ marginBottom: 32, color: "#aaa" }}>
        Update each carousel/business card. Changes are live after you click Save.
      </p>
      {loading && <div style={{ color: "#0af", marginBottom: 16 }}>Loading...</div>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        {media.map((card) =>
          editing === card.id ? (
            <div
              key={card.id}
              style={{
                border: "2px solid #0af",
                borderRadius: 18,
                padding: 22,
                minWidth: 320,
                background: "#20242b",
                flex: "1 1 330px"
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Editing {card.department} (Slot {card.slot})
              </div>
              <input
                type="text"
                placeholder="Title"
                value={form.title || ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6 }}
              />
              <input
                type="text"
                placeholder="Description"
                value={form.description || ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6 }}
              />
              <input
                type="text"
                placeholder="Image URL"
                value={form.img_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, img_url: e.target.value }))}
                style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6 }}
              />
              <input
                type="text"
                placeholder="Link URL"
                value={form.link_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveCard} style={{ background: "#0af", color: "#fff", borderRadius: 7, padding: "8px 24px", fontWeight: 700 }}>
                  Save
                </button>
                <button onClick={() => setEditing(null)} style={{ background: "#fff", color: "#000", borderRadius: 7, padding: "8px 20px", fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              key={card.id}
              style={{
                border: "1.5px solid #222",
                borderRadius: 18,
                padding: 20,
                minWidth: 320,
                background: "#14171f",
                flex: "1 1 330px",
                boxShadow: "0 2px 14px #0af2",
                marginBottom: 24,
                position: "relative"
              }}
            >
              <img src={card.img_url} style={{ width: "100%", borderRadius: 11, marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 21 }}>{card.title}</div>
              <div style={{ fontSize: 14, margin: "4px 0", color: "#b3b3b3" }}>
                {card.description}
              </div>
              <div style={{ fontSize: 12, color: "#54fc79", marginBottom: 8 }}>
                <a href={card.link_url} target="_blank" rel="noopener noreferrer">
                  {card.link_url}
                </a>
              </div>
              <div style={{ fontSize: 13, color: "#0af9" }}>Department: {card.department} &nbsp; | &nbsp; Slot: {card.slot}</div>
              <button
                style={{
                  position: "absolute",
                  top: 12,
                  right: 16,
                  background: "#0af",
                  color: "#fff",
                  borderRadius: 7,
                  padding: "6px 18px",
                  fontWeight: 600,
                  border: "none"
                }}
                onClick={() => editCard(card)}
              >
                Edit
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
