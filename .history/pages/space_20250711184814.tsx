import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import DynamicPyramid from "@/components/EnteractivePyramidWrapper"; // adjust path if needed
import MotionSection from "@/components/MotionSection";
import MotionCard from "@/components/MotionCard";

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
  const [enteractiveData, setEnteractiveData] = useState<any[]>([]);
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

  // Fetch enteractive data for pyramid and progress
  useEffect(() => {
    supabase
      .from("enteractive")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading enteractive data:", error);
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
    <div style={{ padding: 24, background: "#0c0c0c", minHeight: "100vh", color: "#eee" }}>
      {/* 3D Pyramid at the Top */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
        {enteractiveData.length > 0 && (
          <DynamicPyramid
            projectScope={enteractiveData[0].project_scope}
            label={enteractiveData[0].name}
          />
        )}
      </div>

      <h1 style={{
        fontWeight: 700,
        fontSize: 32,
        marginBottom: 20,
        color: "#0ff",
        textShadow: "0 0 6px #0ff, 0 0 12px #0ff"
      }}>
        Your Space
      </h1>

      <MotionSection>
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
                boxShadow: "0 0 8px #0ff"
              }}
            >
              Go to Admin Dashboard
            </button>
          </MotionCard>
        )}

        <MotionCard title="Onboarding Progress">
          {["Art", "Entertainment", "Cuisine", "Fashion", "Health", "Science"].map((dept) => (
            <div key={dept} style={{ margin: "8px 0", width: '400px' }}>
              <span style={{
                color: "#0ff",
                textShadow: "0 0 4px #0ff",
                fontWeight: '600'
              }}>{dept}</span>
              <div style={{
                height: 10, background: "#222", borderRadius: 6, marginTop: 2,
                width: "100%",
              }}>
                <div style={{
                  width: `${Math.floor(Math.random() * 100)}%`,
                  background: "#0ff",
                  height: "100%",
                  borderRadius: 6,
                  boxShadow: "0 0 6px #0ff"
                }} />
              </div>
            </div>
          ))}
        </MotionCard>

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
              marginTop: 12
            }}
          >
            Connect Health Data
          </button>
        </MotionCard>

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
              marginTop: 12
            }}
          >
            Go to Messaging & Groups
          </button>
        </MotionCard>

        <MotionCard title="Your Activities">
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {user ? (
              activities.length ? (
                activities.slice(0, 8).map((a)
