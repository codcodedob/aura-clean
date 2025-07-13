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
  const [showAuth, setShowAuth] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const [enteractiveData, setEnteractiveData] = useState<EnteractiveItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("activity")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setActivities(data ?? []));

      supabase
        .from("enteractive")
        .select("id, name, project_scope, link")
        .then(({ data, error }) => {
          if (error) {
            console.error("Enteractive fetch error:", error);
          } else if (data) {
            const cleaned = data.map((item) => ({
              id: item.id,
              name: item.name,
              project_scope: Number(item.project_scope) || 0,
              link: item.link || "",
            }));
            setEnteractiveData(cleaned);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("companies")
      .select("id")
      .eq("name", "dobe")
      .or(`primary_exec.eq.${user.id},executives.cs."{${user.id}}"`)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Exec check error:", error);
          return;
        }
        if (data) setIsExecutive(true);
      });
  }, [user]);

  function requireAuth(action: () => void) {
    if (!user) setShowAuth(true);
    else action();
  }

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

      <section style={{ marginBottom: 32 }}>
        <h2>Enteractive Project Progress</h2>
        {enteractiveData.length > 0 ? (
          <EnteractivePyramid data={enteractiveData} width={800} height={400} />
        ) : (
          <p>Loading project data...</p>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Activity Tracker</h2>
        {user ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {["past", "present", "future"].map((status) => (
              <div
                key={status}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 200,
                  overflowY: "auto",
                  background: "#fff",
                }}
              >
                <h3 style={{ textTransform: "capitalize" }}>{status}</h3>
                {activities.filter((a) => a.status === status).length ? (
                  activities
                    .filter((a) => a.status === status)
                    .map((a) => (
                      <div
                        key={a.id}
                        style={{
                          borderBottom: "1px solid #eee",
                          paddingBottom: 8,
                          marginBottom: 8,
                        }}
                      >
                        {a.imageurl && a.imageurl.length > 5 ? (
                          <img
                            src={a.imageurl}
                            alt=""
                            style={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 4,
                              marginBottom: 4,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: 100,
                              background: "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                              borderRadius: 4,
                              marginBottom: 4,
                              fontSize: 12,
                            }}
                          >
                            No Image
                          </div>
                        )}
                        <div>
                          <b>Product:</b>{" "}
                          {Array.isArray(a.products) && a.products.length > 0
                            ? a.products[0]
                            : "No product"}
                        </div>
                        <div style={{ fontSize: 14, color: "#555" }}>
                          {a.detail || "No detail"}
                        </div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {a.created_at
                            ? new Date(a.created_at).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    ))
                ) : (
                  <p style={{ fontSize: 13, color: "#999" }}>No activities.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}>Log in to view activities</button>
        )}
      </section>

      <section>
        <h2>Account</h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            maxWidth: 400,
          }}
        >
          {user ? (
            <>
              <div>
                <b>Email:</b> {user.email}
              </div>
              <button
                style={{ marginTop: 18 }}
                onClick={() => supabase.auth.signOut()}
              >
                Log Out
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)}>Log in or Sign up</button>
          )}
        </div>
      </section>
    </div>
  );
}
