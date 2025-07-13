// pages/admin/department-media.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const DEPARTMENTS = [
  { key: "art", label: "Art Department" },
  { key: "business", label: "Business Options" },
  { key: "agx", label: "AGX" },
  { key: "communication", label: "Communication" },
];
const SLOTS = [1, 2, 3, 4];

export default function AdminDepartmentMedia() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    const { error } = await supabase
      .from("department_media")
      .select("*")
      .order("department")
      .order("slot");

    if (error) {
      alert("Error loading media: " + error.message);
    }

    setLoading(false);
  }

  if (loading) return <div style={{ padding: 32 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 1060, margin: "40px auto", padding: 16 }}>
      <h1>Department Media Editor</h1>
      <p>
        Update the images, videos, and text for each business suite/department
        card. Changes are live!
      </p>

      <div
        style={{
          display: "flex",
          gap: 30,
          flexWrap: "wrap",
          marginTop: 26,
        }}
      >
        {DEPARTMENTS.map((dept) => (
          <div key={dept.key} style={{ flex: "1 1 360px", minWidth: 340 }}>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>{dept.label}</h2>
            {SLOTS.map((slot) => (
              <div
                key={slot}
                style={{
                  marginBottom: 36,
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid #ccc",
                  background: "#f8fafd",
                }}
              >
                {/* Add your field display or editing UI here */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
