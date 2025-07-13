"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const EnteractivePyramid = dynamic(() => import("@/components/EnteractivePyramid"), {
  ssr: false,
});

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [enteractiveData, setEnteractiveData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const router = useRouter();

  // Dummy fallback data to prove rendering
  const fallbackActivities = [
    {
      id: "1",
      enteractive: "Project A",
      status: "past",
      type: "Workshop",
      detail: "Completed workshop session",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      enteractive: "Project A",
      status: "present",
      type: "Seminar",
      detail: "Ongoing seminar event",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      enteractive: "Project A",
      status: "future",
      type: "Review",
      detail: "Scheduled project review",
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      enteractive: "Project B",
      status: "future",
      type: "Kickoff",
      detail: "Project kickoff planned",
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));

    // Load pyramid data
    supabase
      .from("enteractive")
      .select("id, name, project_scope, link")
      .then(({ data }) => setEnteractiveData(data || []));

    // Load activities
    setActivities(fallbackActivities);

    // Executive check
    supabase
      .from("companies")
      .select("id")
      .eq("name", "dobe")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsExecutive(true);
      });
  }, []);

  const grouped = activities.reduce((acc, a) => {
    if (!acc[a.enteractive]) acc[a.enteractive] = { past: [], present: [], future: [] };
    acc[a.enteractive][a.status].push(a);
    return acc;
  }, {} as Record<string, { past: any[{filteredActivities.length ? (
    filteredActivities.map((a) => (
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
            src={a.img_url}
            alt={a.name}
            style={{ width: "100%", borderRadius: 4, marginBottom: 6 }}
          />
        )}
        <div style={{ fontWeight: 600 }}>{a.name || "Untitled Activity"}</div>
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
  ]; present: any[{filteredActivities.length ? (
    filteredActivities.map((a) => (
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
            src={a.img_url}
            alt={a.name}
            style={{ width: "100%", borderRadius: 4, marginBottom: 6 }}
          />
        )}
        <div style={{ fontWeight: 600 }}>{a.name || "Untitled Activity"}</div>
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
  ]; future: any[{filteredActivities.length ? (
    filteredActivities.map((a) => (
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
            src={a.img_url}
            alt={a.name}
            style={{ width: "100%", borderRadius: 4, marginBottom: 6 }}
          />
        )}
        <div style={{ fontWeight: 600 }}>{a.name || "Untitled Activity"}</div>
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
  ] }>);

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Space</h1>

      {/* Admin Panel Toggle */}
      {isExecutive && (
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          style={{ marginBottom: 12 }}
        >
          {showAdminPanel ? "Hide Admin" : "Show Admin"}
        </button>
      )}
      {showAdminPanel && (
        <div>
          <button onClick={() => router.push("/admin/dashboard")}>
            Go to Admin Dashboard
          </button>
        </div>
      )}

      {/* Pyramid */}
      {enteractiveData.length ? (
        <EnteractivePyramid data={enteractiveData} width={800} height={400} />
      ) : (
        <p>Loading pyramid...</p>
      )}

      {/* Activities */}
      <section>
        <h2>Activity Overview</h2>
        {Object.keys(grouped).map((key) => (
          <div
            key={key}
            style={{
              border: "1px solid #ddd",
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <h3>{key}</h3>
            <div style={{ display: "flex", gap: 12 }}>
              {["past", "present", "future"].map((col) => (
                <div key={col} style={{ flex: 1 }}>
                  <h4>{col}</h4>
                  {grouped[key][col].length ? (
                    grouped[key][col].map((a) => (
                      <div
                        key={a.id}
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "4px 0",
                        }}
                      >
                        <b>{a.type}</b>
                        <div>{a.detail}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#888" }}>None</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
