"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Dynamically import EnteractivePyramid with no SSR
const EnteractivePyramid = dynamic(
  () => import("@/components/EnteractivePyramid"),
  { ssr: false }
);

type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number;
  link: string;
};

type ActivityItem = {
  id: string;
  enteractive: string;
  status: "past" | "present" | "future";
  type: string;
  detail: string | null;
  created_at: string;
};

function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <h2>Please log in or sign up</h2>
        <button style={{ marginTop: 24, width: "100%" }} onClick={onClose}>
          Demo: Close
        </button>
      </div>
    </div>
  );
}

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const [enteractiveData, setEnteractiveData] = useState<EnteractiveItem[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Fetch enteractives and activities
  useEffect(() => {
    if (!user) return;

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

    supabase
      .from("activity")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Activity fetch error:", error);
        } else if (data) {
          setActivities(data);
        }
      });
  }, [user]);

  // Executive check
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

  function handleDeleteAccount() {
    alert("Delete account: (not implemented)");
  }

  // Group activities by enteractive
  const groupedActivities: Record<
    string,
    { past: ActivityItem[]; present: ActivityItem[]; future: ActivityItem[] }
  > = {};
  activities.forEach((a) => {
    if (!groupedActivities[a.enteractive]) {
      groupedActivities[a.enteractive] = { past: [], present: [], future: [] };
    }
    if (a.status === "past") groupedActivities[a.enteractive].past.push(a);
    if (a.status === "present") groupedActivities[a.enteractive].present.push(a);
    if (a.status === "future") groupedActivities[a.enteractive].future.push(a);
  });

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 20 }}>Your Space</h1>

      {/* Admin toggle */}
      {isExecutive && (
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          style={{
            background: showAdminPanel ? "#ddd" : "#111",
            color: showAdminPanel ? "#111" : "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 24,
            cursor: "pointer",
          }}
        >
          {showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
        </button>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            boxShadow: "0 2px 10px #0002",
          }}
        >
          <h3>Executive Tools</h3>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              background: "#111",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 6,
            }}
          >
            Go to Admin Dashboard
          </button>
        </div>
      )}

      {/* Enteractive Pyramid */}
      <section style={{ marginBottom: 32 }}>
        <h2>Enteractive Project Progress</h2>
        {enteractiveData.length ? (
          <EnteractivePyramid data={enteractiveData} width={800} height={400} />
        ) : (
          <p>Loading project data...</p>
        )}
      </section>

      {/* High-definition Activity Dashboard */}
      <section>
        <h2>Activity Overview</h2>
        {Object.keys(groupedActivities).length ? (
          Object.entries(groupedActivities).map(([enteractiveId, group]) => (
            <div
              key={enteractiveId}
              style={{
                marginBottom: 32,
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <h3>Enteractive: {enteractiveId}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {["past", "present", "future"].map((status) => (
                  <div
                    key={status}
                    style={{
                      flex: 1,
                      background: "#fff",
                      borderRadius: 8,
                      padding: 8,
                      minHeight: 120,
                    }}
                  >
                    <h4 style={{ textTransform: "capitalize" }}>{status}</h4>
                    {group[status as "past" | "present" | "future"].length ? (
                      group[status as "past" | "present" | "future"].map((a) => (
                        <div
                          key={a.id}
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: "6px 0",
                          }}
                        >
                          <b>{a.type}</b>
                          <div style={{ fontSize: 12 }}>{a.detail || "No detail"}</div>
                          <div style={{ fontSize: 11, color: "#999" }}>
                            {a.created_at
                              ? new Date(a.created_at).toLocaleString()
                              : ""}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: 12, color: "#999" }}>None</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No activities found.</p>
        )}
      </section>

      {/* Account */}
      <section style={{ marginTop: 32 }}>
        <h2>Account</h2>
        {user ? (
          <div>
            <div>
              <b>Email:</b> {user.email}
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{ marginTop: 8 }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}>Log in or Sign up</button>
        )}
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
