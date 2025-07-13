// pages/fam-awards.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Image from "next/image";

type Award = {
  id: string;
  award_name: string;
  year: number;
  winner_name: string;
  video_url?: string | null;
  image_url?: string | null;
};

export default function FamAwards() {
  const [awards, setAwards] = useState<Award[]>([]);

  useEffect(() => {
    const fetchAwards = async () => {
      const { data, error } = await supabase
        .from("fam_awards")
        .select("*")
        .order("year", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Error loading awards");
      } else {
        setAwards(data || []);
      }
    };
    fetchAwards();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Fam Awards</h1>
      {awards.map((award) => (
        <div
          key={award.id}
          style={{
            background: "#111",
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h2 style={{ color: "#fff" }}>
            {award.award_name} ({award.year})
          </h2>
          <p style={{ color: "#aaa" }}>Winner: {award.winner_name}</p>

          {award.image_url && (
            <Image
              src={award.image_url}
              alt={award.award_name}
              width={800}
              height={400}
              style={{ borderRadius: 8 }}
            />
          )}

          {award.video_url && (
            <video
              src={award.video_url}
              controls
              style={{ marginTop: 12, width: "100%", borderRadius: 8 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
