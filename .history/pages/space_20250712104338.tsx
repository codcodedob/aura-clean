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

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Load data (enteractive + activities)
  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase.from("enteractive").select("id, name, project_scope, link"),
      supabase.from("activity").select("*").order("created_at", { ascending: false }),
    ]).then(([enteractiveRes, activityRes]) => {
      const enteractiveList = enteractiveRes.data ?? [];
      const activityList = activityRes.data ?? [];

      const enteractiveIds = new Set(enteractiveList.map((e) => e.id));

      // Filter activities to those matching known enteractive IDs
      const filteredActivities = activityList.filter((a) =>
        a.enteractive && enteractiveIds.has(a.enteractive)
      );

      console.log("Raw Activities:", activityList);
      console.log("Valid Enteractive IDs:", Array.from(enteractiveIds));
      console.log("Filtered Activities:", filteredActivities);

      setEnteractiveData(
        enteractiveList.map((item) => ({
          id: item.id,
          name: item.name,
          project_scope: Number(item.project_scope) || 0,
          link: item.link || "",
        }))
      );

      setActivities(filteredActivities);
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
        {enteractiveData.length > 0 ? (
          <EnteractivePyramid data={enteractiveData} width={800} height={400} />
        ) : (
          <p>Loading project data...</p>
        )}
      </section>

      {/* Activities */}
      <section>
        <h2>Activities</h2>
        {["past", "present", "future"].map((status) => (
          <div key={status} style={{ marginBottom: 24 }}>
            <h3 style={{ textTransform: "capitalize" }}>{status}</h3>
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: 16,
                paddingBottom: 8,
              }}
            >
              {activities.filter((a) => a.status === status).length ? (
                activities
                  .filter((a) => a.status === status)
                  .map((a) => (
                    <div
                      key={a.id}
                      style={{
                        minWidth: 250,
                        background: "#fff",
                        borderRadius: 8,
                        padding: 12,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      {a.imageurl && (
                        <img
                          src={a.imageurl}
                          alt=""
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 6,
                            marginBottom: 8,
                          }}
                        />
                      )}
                      <div>
                        <strong>
                          {Array.isArray(a.products)
                            ? a.products[0]
                            : a.products || "No product"}
                        </strong>
                      </div>
                      <div style={{ fontSize: 14, color: "#555" }}>
                        {a.detail || "No detail"}
                      </div>
                    </div>
                  ))
              ) : (
                <p style={{ fontSize: 14, color: "#999" }}>No activities</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Account */}
      <section style={{ marginTop: 32 }}>
        <h2>Account</h2>
        <div
          style={{ background: "#fff", borderRadius: 12, padding: 20, maxWidth: 400 }}
        >
          {user ? (
            <>
              <div>
                <b>Email:</b> {user.email}
              </div>
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
            <button onClick={() => setShowAuth(true)}>Log in or Sign up</button>
          )}
        </div>
      </section>

      {showAuth && (
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
            <button style={{ marginTop: 24, width: "100%" }} onClick={() => setShowAuth(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
