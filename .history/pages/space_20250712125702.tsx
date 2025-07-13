// pages/space.tsx
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import type { User } from "@supabase/supabase-js";

// Dynamically import the Pyramid
const EnteractivePyramid = dynamic(() => import("@/components/EnteractivePyramid"), { ssr: false });

// IDs for the Enteractive categories
const ENTERACTIVE_IDS = {
  art: "5e0b4651-ad50-4c52-be01-5a4f170ebe5b",
  entertainment: "966b20c0-7451-44e7-aa37-fab5e880f027",
  cuisine: "4b8d7fc7-6b79-4218-bd77-6e8ccb8c4d27",
  fashion: "497ae136-4fb6-4b4b-8416-6c3f445d9e4e",
  health: "3be3a0c4-e007-42b2-abcc-c5f3eb1390d6",
  science: "0f9be03d-5bf3-417c-a931-02d4d4239072",
  community: "27891c1b-4630-4a6c-83b7-a1126809a2fc",
};

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [enteractiveData, setEnteractiveData] = useState<any[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const router = useRouter();

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Fetch Enteractive and activities
  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const { data: enter } = await supabase.from("enteractive").select("id, name, project_scope, link");
      setEnteractiveData(enter ?? []);

      const { data: acts } = await supabase.from("activity").select("*");
      setActivities(acts ?? []);
    };
    fetchAll();

    // Realtime subscription
    const sub = supabase
      .channel("activity_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity" },
        () => fetchAll()
      )
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [user]);

  // Exec check
  useEffect(() => {
    if (!user) return;
    supabase
      .from("companies")
      .select("id")
      .eq("name", "dobe")
      .or(`primary_exec.eq.${user.id},executives.cs."{${user.id}}"`)
      .maybeSingle()
      .then(({ data }) => data && setIsExecutive(true));
  }, [user]);

  function requireAuth(action: () => void) {
    if (!user) setShowAuth(true);
    else action();
  }

  // Group activities by enteractive and status
  const grouped = Object.entries(ENTERACTIVE_IDS).map(([label, id]) => ({
    label,
    past: activities.filter((a) => a.enteractive === id && a.status === "past"),
    present: activities.filter((a) => a.enteractive === id && a.status === "present"),
    future: activities.filter((a) => a.enteractive === id && a.status === "future"),
  }));

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h1>Your Space</h1>

      {isExecutive && (
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{ background: "#000", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 20 }}
        >
          Go to Admin Dashboard
        </button>
      )}

      <section style={{ marginBottom: 32 }}>
        <h2>Enteractive Pyramid</h2>
        {enteractiveData.length ? (
          <EnteractivePyramid
            data={enteractiveData.map((e) => ({
              id: e.id,
              name: e.name,
              project_scope: Number(e.project_scope) || 0,
              link: e.link || "",
            }))}
            width={800}
            height={400}
          />
        ) : (
          <p>Loading pyramid...</p>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Halo Range</h2>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
          <p>Collaborate and message your teams here.</p>
        </div>
      </section>

      {grouped.map(({ label, past, present, future }) => (
        <section key={label} style={{ marginBottom: 32 }}>
          <h3>{label.toUpperCase()}</h3>
          <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
            {["past", "present", "future"].map((status) => {
              const items = { past, present, future }[status];
              return (
                <div key={status} style={{ minWidth: 220 }}>
                  <h4>{status}</h4>
                  {items.length ? (
                    items.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: 8,
                          marginBottom: 8,
                          padding: 8,
                          background: "#fff",
                        }}
                      >
                        {a.imageurl && (
                          <img
                            src={a.imageurl}
                            alt=""
                            style={{ width: "100%", borderRadius: 4, marginBottom: 4 }}
                          />
                        )}
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                          {Array.isArray(a.products) ? a.products[0] : a.products}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>{a.detail}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 12, color: "#999" }}>No {status} activities</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {showAuth && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ background: "#fff", padding: 32, borderRadius: 12 }}>
            <h2>Log in required</h2>
            <button onClick={() => setShowAuth(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
