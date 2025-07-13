// app/space.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface EnteractiveRecord {
  id: number;
  name: string;
  description: string;
  img_url: string;
  link: string;
  is_active: boolean;
  progress: number;
  project_scope: string;
  created_at: string;
}

export default function Space() {
  const [enteractives, setEnteractives] = useState<EnteractiveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEnteractives = async () => {
      const { data, error } = await supabase
        .from("enteractive")
        .select(
          "id, name, description, img_url, link, is_active, progress, project_scope, created_at"
        );

      if (error) {
        console.error("Error fetching enteractives:", error);
      } else if (data) {
        setEnteractives(data as EnteractiveRecord[]);
      }
      setLoading(false);
    };

    fetchEnteractives();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Enteractive Progress</h1>

      {loading && <p>Loading...</p>}

      {!loading && enteractives.length === 0 && <p>No enteractives found.</p>}

      {enteractives.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          {item.img_url && (
            <img
              src={item.img_url}
              alt={item.name}
              style={{ width: "100%", borderRadius: 4, marginBottom: 8 }}
            />
          )}

          {/* Progress Bar */}
          <div style={{ margin: "8px 0" }}>
            <div
              style={{
                background: "#eee",
                height: 10,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${item.progress}%`,
                  background: "#3b82f6",
                  height: "100%",
                  borderRadius: 6,
                }}
              />
            </div>
            <small>{item.progress}% Complete</small>
          </div>

          {/* Video Preview */}
          {item.link && (
            <div style={{ marginTop: 12 }}>
              <video
                src={item.link}
                controls
                style={{ width: "100%", borderRadius: 4 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
