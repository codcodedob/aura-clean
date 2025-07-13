// pages/space.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import DynamicPyramid from "@/components/EnteractivePyramidWrapper"; // Your dynamic pyramid component
import MotionSection from "@/components/MotionSection"; // GSAP animated section wrapper
import MotionCard from "@/components/MotionCard"; // GSAP animated card wrapper

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
  const [activities, setActivities] = useState<any[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const [enteractiveData, setEnteractiveData] = useState<
    { id: string; name: string; project_scope: number }[]
  >([]);
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

  // Fetch enteractive data for dynamic pyramid and project scopes
  useEffect(() => {
    supabase
      .from("enteractive")
      .select("id, name, project_scope")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching enteractive data:", error);
          return;
        }
        setEnteractiveData(data ?? []);
      });
  }, []);

  function requireAuth(action: () => void) {
    if (!user) setShowAuth(true);
    else action();
  }

  function handleDeleteAccount() {
    alert("Delete account: (not implemented)");
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#0c0c0c",
        minHeight: "100vh",
        color: "#eee",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* 3D Pyramid at the Top */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
        {enteractiveData.length > 0 && (
          <DynamicPyramid
            projectScope={enteractiveData[0].project_scope}
            label={enteractiveData[0].name}
          />
        )}
      </div>

      <h1
        style={{
          fontWeight: 700,
          fontSize: 32,
          marginBottom: 20,
          color: "#0ff",
          textShadow: "0 0 6px #0ff, 0 0 12px #0ff",
        }}
      >
        Your Space
      </h1>

      <MotionSection>
        {/* Admin Button for Executives */}
        {isExecutive && (
          <MotionCard title="Admin Controls">
            <button
              onClick={() => router.push("/admin/dashboard")}
              style={{
                background: "#0ff",
                color: "#000",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 0 8px #0ff",
              }}
            >
              Go to Admin Dashboard
            </button>
          </MotionCard>
        )}

        {/* Onboarding Progress */}
        <MotionCard title="Onboarding Progress">
          {["Art", "Entertainment", "Cuisine", "Fashion", "Health", "Science"].map(
            (dept) => (
              <div key={dept} style={{ margin: "8px 0", width: "400px" }}>
                <span
                  style={{
                    color: "#0ff",
                    textShadow: "0 0 4px #0ff",
                    fontWeight: "600",
                  }}
                >
                  {dept}
                </span>
                <div
                  style={{
                    height: 10,
                    background: "#222",
                    borderRadius: 6,
                    marginTop: 2,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.floor(Math.random() * 100)}%`,
                      background: "#0ff",
                      height: "100%",
                      borderRadius: 6,
                      boxShadow: "0 0 6px #0ff",
                    }}
                  />
                </div>
              </div>
            )
          )}
        </MotionCard>

        {/* Life Suite */}
        <MotionCard title="Life Suite: ArcSession Halogen">
          <p style={{ color: "#0ff" }}>
            Collect and visualize your health/life data here. (Demo stub)
          </p>
          <button
            onClick={() => requireAuth(() => alert("Open health data panel"))}
            style={{
              background: "#0ff",
              color: "#000",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: "0 0 8px #0ff",
              marginTop: 12,
            }}
          >
            Connect Health Data
          </button>
        </MotionCard>

        {/* Communications */}
        <MotionCard title="Halo Range: Communications & Groups">
          <p style={{ color: "#0ff" }}>
            Create or join chat groups for family, work, friends, gifting, and more.
          </p>
          <button
            onClick={() => requireAuth(() => router.push("/inbox"))}
            style={{
              background: "#0ff",
              color: "#000",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: "0 0 8px #0ff",
              marginTop: 12,
            }}
          >
            Go to Messaging & Groups
          </button>
        </MotionCard>

        {/* Activities */}
        <MotionCard title="Your Activities">
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {user ? (
              activities.length ? (
                activities.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    style={{ borderBottom: "1px solid #444", padding: "12px 0" }}
                  >
                    <div style={{ color: "#0ff" }}>
                      <b>Type:</b> {a.type} &nbsp;
                      <b>Status:</b> {a.status} &nbsp;
                      <b>State:</b> {a.state}
                    </div>
                    <div style={{ fontSize: 14, color: "#33ffff" }}>
                      {a.detail || "No detail"}
                    </div>
                    <div style={{ fontSize: 12, color: "#009999" }}>
                      {a.activityStartTimestamp
                        ? new Date(a.activityStartTimestamp).toLocaleString()
                        : ""}
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent activity.</p>
              )
            ) : (
              <button onClick={() => setShowAuth(true)}>Log in to view activities</button>
            )}
          </div>
        </MotionCard>

        {/* Account Management */}
        <MotionCard title="Account Management">
          {user ? (
            <>
              <div>
                <b>Email:</b>{" "}
                <span style={{ color: "#0ff" }}>{user.email}</span>
              </div>
              <button
                style={{
                  marginTop: 18,
                  background: "#0ff",
                  color: "#000",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  boxShadow: "0 0 8px #0ff",
                }}
                onClick={() => supabase.auth.signOut()}
              >
                Log Out
              </button>
              <button
                style={{
                  marginTop: 12,
                  background: "#ef4444",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  boxShadow: "0 0 8px #ef4444",
                }}
                onClick={() => requireAuth(handleDeleteAccount)}
              >
                Delete Account
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              style={{
                background: "#0ff",
                color: "#000",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 0 8px #0ff",
              }}
            >
              Log in or Sign up
            </button>
          )}
        </MotionCard>
      </MotionSection>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
