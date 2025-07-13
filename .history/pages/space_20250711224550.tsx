// pages/space.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

interface EnteractiveRecord {
  id: string;
  link: string;
  progress: number;
}

function VideoProgressBar({ record }: { record: EnteractiveRecord }) {
  return (
    <div
      style={{
        position: "relative",
        height: "20px",
        backgroundColor: "#e5e7eb", // Tailwind gray-200
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      <video
        src={record.link}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${record.progress}%`,
          width: `${100 - record.progress}%`,
          height: "100%",
          backgroundColor: "#e5e7eb",
        }}
      />
    </div>
  );
}

export default function Space() {
  const [records, setRecords] = useState<EnteractiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("enteractive")
        .select("id, link, progress");

      if (error) {
        console.error("Error fetching enteractive records:", error);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Enteractive Videos</h1>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No enteractive records found.</p>
      ) : (
        records.map((record) => (
          <div key={record.id}>
            <VideoProgressBar record={record} />
            <p>ID: {record.id} | Progress: {record.progress}%</p>
          </div>
        ))
      )}
    </div>
  );
}
