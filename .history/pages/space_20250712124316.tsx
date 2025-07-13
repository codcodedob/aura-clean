// pages/space.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// 3D Pyramid
const EnteractivePyramid = dynamic(
  () => import("@/components/EnteractivePyramid"),
  { ssr: false }
);

type Activity = {
  id: string;
  enteractive: string;
  status: "past" | "present" | "future";
  imageurl: string | null;
  detail: string | null;
  created_at: string;
  products: string[] | null;
};

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const router = useRouter();

  // Check user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  // Fetch activities
  useEffect(() => {
    supabase
      .from("activity")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setActivities((data as Activity[]) || []);
      });
  }, []);

  // Check admin
  useEffect(() => {
    if (!user) return;
    supabase
      .from("companies")
      .select("id")
      .eq("name", "dobe")
      .or(`primary_exec.eq.${user.id},executives.cs."{${user.id}}"`)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setIsExecutive(true);
      });
  }, [user]);

  const categories = [
    { label: "Art", id: "5e0b4651-ad50-4c52-be01-5a4f170ebe5b" },
    { label: "Entertainment", id: "966b20c0-7451-44e7-aa37-fab5e880f027" },
    { label: "Cuisine", id: "4b8d7fc7-6b79-4218-bd77-6e8ccb8c4d27" },
    { label: "Fashion", id: "497ae136-4fb6-4b4b-8416-6c3f445d9e4e" },
    { label: "Health & Fitness", id: "3be3a0c4-e007-42b2-abcc-c5f3eb1390d6" },
    { label: "Science & Tech", id: "0f9be03d-5bf3-417c-a931-02d4d4239072" },
    { label: "Community Clipboard", id: "27891c1b-4630-4a6c-83b7-a1126809a2fc" },
  ];

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 20 }}>Your Space</h1>

      {isExecutive && (
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{
            background: "#111",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 24,
            cursor: "pointer",
          }}
        >
          Go to Admin Dashboard
        </button>
      )}

      {/* 3D Pyramid */}
      <section style={{ marginBottom: 32 }}>
        <h2>Enteractive Project Progress</h2>
        <EnteractivePyramid data={[]} width={800} height={400} />
      </section>

      {/* Activity Rows */}
      {categories.map((cat) => (
        <section key={cat.id} style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 8 }}>{cat.label}</h3>
          <div style={{ display: "flex", gap: "16px" }}>
            {["past", "present", "future"].map((status) => (
              <div
                key={status}
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: "0 2px 8px #0001",
                  minHeight: 200,
                  overflowX: "auto",
                }}
              >
                <h4 style={{ textTransform: "capitalize", marginBottom: 8 }}>
                  {status}
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                  }}
                >
                  {activities
                    .filter(
                      (a) =>
                        a.enteractive === cat.id && a.status === status
                    )
                    .map((a) => (
                      <div
                        key={a.id}
                        style={{
                          minWidth: 200,
                          background: "#f0f0f0",
                          borderRadius: 8,
                          padding: 8,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        {a.imageurl ? (
                          <img
                            src={a.imageurl}
                            alt={a.detail ?? "Activity"}
                            style={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: 100,
                              background: "#ddd",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#888",
                              fontSize: 12,
                            }}
                          >
                            No Image
                          </div>
                        )}
                        <div style={{ fontSize: 14, marginTop: 6, textAlign: "center" }}>
                          {a.products?.[0] ?? "No product"}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#555",
                            textAlign: "center",
                            marginTop: 4,
                          }}
                        >
                          {a.detail ?? ""}
                        </div>
                      </div>
                    ))}
                  {activities.filter(
                    (a) => a.enteractive === cat.id && a.status === status
                  ).length === 0 && (
                    <p style={{ fontSize: 12, color: "#999" }}>
                      No activities.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
