// pages/famawards.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";

// Define a proper type instead of `any`
type Award = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  thumbnail_url?: string;
};

export default function FamAwards() {
  const router = useRouter();
  const [awards, setAwards] = useState<Award[]>([]);

  useEffect(() => {
    const fetchAwards = async () => {
      const { data, error } = await supabase
        .from("fam_awards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Error loading awards");
      } else {
        setAwards(data || []);
      }
    };
    fetchAwards();
  }, []);

  const handleVote = async (awardId: string, userId: string, value: number) => {
    const { error } = await supabase
      .from("fam_award_votes")
      .upsert([
        {
          award_id: awardId,
          user_id: userId,
          vote_value: value,
        },
      ]);

    if (error) {
      console.error(error);
      toast.error("Error recording vote");
    } else {
      toast.success("Vote recorded!");
    }
  };

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
          <h2 style={{ color: "#fff" }}>{award.title}</h2>
          <p style={{ color: "#aaa" }}>{award.description}</p>
          {award.image_url && (
            <Image
              src={award.image_url}
              alt={award.title}
              width={800}
              height={400}
              style={{ borderRadius: 8 }}
            />
          )}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => handleVote(award.id, "currentUserId", 1)}
              style={{
                background: "#0af",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Vote Up
            </button>
          </div>
        </div>
      ))}
      <div>
        {awards.map((award) => (
          <div key={award.id} style={{ marginBottom: 24 }}>
            <h3>{award.title}</h3>
            {award.thumbnail_url && (
              <Image
                src={award.thumbnail_url}
                alt={award.title}
                width={400}
                height={200}
                style={{ borderRadius: 6 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
