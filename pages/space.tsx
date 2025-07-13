// pages/space.tsx
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { checkIsAdmin } from "@/lib/useIsAdmin";

// Dynamically load EnteractivePyramid (no SSR)
const EnteractivePyramid = dynamic(() => import("@/components/EnteractivePyramid"), {
  ssr: false,
});

interface EnteractiveRow {
  id: string;
  name: string;
  project_scope: number | null;
  link: string | null;
}

type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number;
  link: string;
};

type Activity = {
  id: string;
  enteractive: string;
  status: "past" | "present" | "future";
  detail?: string;
  products?: string[] | string;
  imageurl?: string;
  created_at?: string;
  [key: string]: unknown;
};

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [isExecutive, setIsExecutive] = useState(false);
  const [enteractiveData, setEnteractiveData] = useState<EnteractiveItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const ENTERACTIVE_IDS = {
    art: "5e0b4651-ad50-4c52-be01-5a4f170ebe5b",
    entertainment: "966b20c0-7451-44e7-aa37-fab5e880f027",
    cuisine: "4b8d7fc7-6b79-4218-bd77-6e8ccb8c4d27",
    fashion: "497ae136-4fb6-4b4b-8416-6c3f445d9e4e",
    health: "3be3a0c4-e007-42b2-abcc-c5f3eb1390d6",
    science: "0f9be03d-5bf3-417c-a931-02d4d4239072",
    community: "27891c1b-4630-4a6c-83b7-a1126809a2fc",
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    if (user) {
      checkIsAdmin(user.id).then(setIsExecutive);

      supabase
  .from<"enteractive", EnteractiveRow>("enteractive")
  .select("*")

        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching enteractive:", error);
            return;
          }
          if (data) {
            setEnteractiveData(
              data.map((item) => ({
                id: String(item.id),
                name: String(item.name),
                project_scope: Number(item.project_scope) || 0,
                link: String(item.link ?? ""),
              }))
            );
          }
        });

      const channel = supabase
        .channel("realtime-activities")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "activity" },
          () => fetchActivities()
        )
        .subscribe();

      fetchActivities();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchActivities = () => {
    supabase
      .from("activity")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setActivities(data ?? []));
  };

  const filterActivities = (enteractiveId: string, status: string) =>
    activities
      .filter((a) => a.enteractive === enteractiveId && a.status === status)
      .filter(
        (a) =>
          a.detail?.toLowerCase().includes(search.toLowerCase()) ||
          (Array.isArray(a.products)
            ? a.products.join(" ").toLowerCase().includes(search.toLowerCase())
            : "")
      );

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 20 }}>Your Space</h1>

      {isExecutive && (
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{
            background: "#000",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          Go to Admin Dashboard
        </button>
      )}

      <section style={{ marginBottom: 32 }}>
        <h2>Enteractive Project Progress</h2>
        {enteractiveData.length ? (
          <EnteractivePyramid data={enteractiveData} width={800} height={400} />
        ) : (
          <p>Loading projects...</p>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Activities Tracker</h2>
        <input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginBottom: 16,
            padding: 8,
            width: "100%",
            maxWidth: 400,
          }}
        />
        {Object.entries(ENTERACTIVE_IDS).map(([category, id]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8 }}>{category.toUpperCase()}</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {["past", "present", "future"].map((status) => (
                <div
                  key={status}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 120,
                    overflowX: "auto",
                  }}
                >
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>
                    {status.toUpperCase()}
                  </h4>
                  <div style={{ display: "flex", gap: 12 }}>
                    {filterActivities(id, status).map((a) => (
                      <div
                        key={a.id}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 8,
                          padding: 8,
                          minWidth: 160,
                          maxWidth: 200,
                        }}
                      >
                        {a.imageurl && (
                          <img
                            src={a.imageurl}
                            alt="activity"
                            style={{
                              width: "100%",
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        )}
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          {Array.isArray(a.products)
                            ? a.products[0]
                            : a.products}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {a.detail}
                        </div>
                      </div>
                    ))}
                    {!filterActivities(id, status).length && (
                      <div style={{ fontSize: 12, color: "#999" }}>
                        No activities
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Halo Range & Life Suite</h2>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              flex: "1 1 300px",
            }}
          >
            <h3>Halo Range: Messaging</h3>
            <button onClick={() => router.push("/inbox")}>
              Go to Messaging
            </button>
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              flex: "1 1 300px",
            }}
          >
            <h3>Life Suite: ArcSession</h3>
            <button onClick={() => alert("Open health dashboard")}>
              Connect Health Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
