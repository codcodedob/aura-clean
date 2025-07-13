// pages/space.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import EnteractivePyramid from "@/components/EnteractivePyramid";

function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, maxWidth: 400, width: "100%" }}>
        <h2>Please log in or sign up</h2>
        <button style={{ marginTop: 24, width: "100%" }} onClick={onClose}>Demo: Close</button>
      </div>
    </div>
  );
}

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setActivities(data ?? []));
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

  function handleDeleteAccount() {
    alert("Delete account: (not implemented)");
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* 3D Pyramid at the Top */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
        <EnteractivePyramid
          projectScope={42} // you can replace this with live data
          label="Entertainment"
        />
      </div>

      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 20 }}>Your Space</h1>

      {/* Admin Button for Executives */}
      {isExecutive && (
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{
            background: "#111",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 24,
            cursor: "pointer"
          }}
        >
          Go to Admin Dashboard
        </button>
      )}

      {/* Onboarding Progress */}
      <section style={{ marginBottom: 32 }}>
        <h2>Onboarding Progress</h2>
        {["Art", "Entertainment", "Cuisine", "Fashion", "Health", "Science"].map((dept) => (
          <div key={dept} style={{ margin: "8px 0" }}>
            <span>{dept}</span>
            <div style={{
              height: 10, background: "#e5e7eb", borderRadius: 6, marginTop: 2,
              width: "100%", maxWidth: 400
            }}>
              <div style={{
                width: `${Math.floor(Math.random() * 100)}%`,
                background: "#3b82f6", height: "100%", borderRadius: 6
              }} />
            </div>
          </div>
        ))}
      </section>

      {/* Life Suite */}
      <section style={{ marginBottom: 32 }}>
        <h2>Life Suite: ArcSession Halogen</h2>
        <div style={{
          background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px #0af2"
        }}>
          <p>Collect and visualize your health/life data here. (Demo stub)</p>
          <button onClick={() => requireAuth(() => alert("Open health data panel"))}>
            Connect Health Data
          </button>
        </div>
      </section>

      {/* Communications */}
      <section style={{ marginBottom: 32 }}>
        <h2>Halo Range: Communications & Groups</h2>
        <div style={{
          background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px #0af2"
        }}>
          <p>Create or join chat groups for family, work, friends, gifting, and more.</p>
          <button onClick={() => requireAuth(() => router.push("/inbox"))}>
            Go to Messaging & Groups
          </button>
        </div>
      </section>

      {/* Activities */}
      <section style={{ marginBottom: 32 }}>
        <h2>Your Activities</h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, maxHeight: 300, overflowY: "auto" }}>
          {user ? (
            activities.length ? (
              activities.slice(0, 8).map((a) => (
                <div key={a.id} style={{ borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
                  <div>
                    <b>Type:</b> {a.type} &nbsp;
                    <b>Status:</b> {a.status} &nbsp;
                    <b>State:</b> {a.state}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>{a.detail || "No detail"}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {a.activityStartTimestamp
                      ? new Date(a.activityStartTimestamp).toLocaleString()
                      : ""}
                  </div>
                </div>
              ))
            ) : <p>No recent activity.</p>
          ) : <button onClick={() => setShowAuth(true)}>Log in to view activities</button>}
        </div>
      </section>

      {/* Account Management */}
      <section>
        <h2>Account Management</h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, maxWidth: 400 }}>
          {user ? (
            <>
              <div><b>Email:</b> {user.email}</div>
              <button style={{ marginTop: 18 }} onClick={() => supabase.auth.signOut()}>
                Log Out
              </button>
              <button
                style={{ marginTop: 12, background: "#ef4444", color: "#fff" }}
                onClick={() => requireAuth(handleDeleteAccount)}
              >
                Delete Account
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)}>
              Log in or Sign up
            </button>
          )}
        </div>
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
