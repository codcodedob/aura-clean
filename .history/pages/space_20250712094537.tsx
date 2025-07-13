// pages/space.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const EnteractivePyramid = dynamic(() => import("@/components/EnteractivePyramid"), {
  ssr: false,
});

type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number;
  link: string;
};

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [enteractiveData, setEnteractiveData] = useState<EnteractiveItem[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch all activities
    supabase
      .from("activity")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Activities fetch error:", error);
        else setActivities(data ?? []);
      });

    // Fetch enteractive data
    supabase
      .from("enteractive")
      .select("id, name, project_scope, link")
      .then(({ data, error }) => {
        if (error) console.error("Enteractive fetch error:", error);
        else if (data) {
          const cleaned = data.map((item) => ({
            id: item.id,
            name: item.name,
            project_scope: Number(item.project_scope) || 0,
            link: item.link || "",
          }));
          setEnteractiveData(cleaned);
        }
      });

    // Executive check
    supabase
      .from("companies")
      .select("id")
      .eq("name", "dobe")
      .or(`primary_exec.eq.${user.id},executives.cs."{${user.id}}"`)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Exec check error:", error);
        if (data) setIsExecutive(true);
      });
  }, [user]);

  function requireAuth(action: () => void) {
    if (!user) setShowAuth(true);
    else action();
  }

  const statuses = ["future", "present", "past"];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 20 }}>Your Space</h1>

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

      {/* Enteractive Pyramid */}
      <section style={{ marginBottom: 32 }}>
        <h2>Enteractive Project Progress</h2>
        {enteractiveData.length > 0 ? (
          <EnteractivePyramid data={enteractiveData} width={800} height={400} />
        ) : (
          <p>Loading project data...</p>
        )}
      </section>

      {/* Activities by Status */}
      <section>
        <h2>Your Activities by Status</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {statuses.map((status) => {
            const filtered = activities.filter((a) => a.status === status);

            return (
              <div
                key={status}
                style={{
                  flex: "1 1 30%",
                  background: "#f9fafb",
                  padding: 12,
                  borderRadius: 8,
                  minWidth: 250,
                }}
              >
                <h3 style={{ textTransform: "capitalize" }}>{status}</h3>
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 8,
                        marginBottom: 8,
                        background: "#fff",
                      }}
                    >
                      {a.img_url && (
                        <img
                          src={a.imageurl}
                          alt={a.name || "Activity"}
                          style={{
                            width: "100%",
                            borderRadius: 4,
                            marginBottom: 6,
                          }}
                        />
                      )}
                      <div style={{ fontWeight: 600 }}>
                        {a.name || "Untitled Activity"}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {a.detail || "No description"}
                      </div>
                      <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: "#999" }}>No {status} activities.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Account Management */}
      <section style={{ marginTop: 40 }}>
        <h2>Account</h2>
        {user ? (
          <div>
            <div>
              <b>Email:</b> {user.email}
            </div>
            <button
              style={{ marginTop: 12 }}
              onClick={() => supabase.auth.signOut()}
            >
              Log Out
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}>Log in or Sign up</button>
        )}
      </section>
    </div>
  );
}
