"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

// Dynamically import the pyramid with no SSR
const EnteractivePyramid = dynamic(() => import("../components/EnteractivePyramid"), {
  ssr: false,
});

type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number;
  link: string;
};

export default function Space() {
  const [enteractiveData, setEnteractiveData] = useState<EnteractiveItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnteractive() {
      const { data, error } = await supabase
        .from("enteractive")
        .select("id, name, project_scope, link")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error loading enteractive data:", error);
        setEnteractiveData([]);
      } else {
        setEnteractiveData(data);
      }
      setLoading(false);
    }
    fetchEnteractive();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading enteractive data...</div>;

  if (!enteractiveData || enteractiveData.length === 0)
    return <div style={{ padding: 24 }}>No enteractive data available.</div>;

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 20 }}>Your Space</h1>

      <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
        <EnteractivePyramid data={enteractiveData} width={600} height={400} />
      </div>

      {/* Other page content and Auth Modal here, unchanged */}
    </div>
  );
}
