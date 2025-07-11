"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import GravityScene from "@/components/GravityScene";
import BusinessCarousel from "@/components/BusinessCarousel";

const DEPARTMENTS = [
  "Art",
  "Entertainment",
  "Fashion",
  "Health n Fitness",
  "Science",
  "Community Clipboard",
] as const;

type Department = typeof DEPARTMENTS[number];

type MediaItem = {
  id: string;
  department: string;
  title: string;
  description: string;
  img_url?: string;
  video_url?: string;
  link_url?: string;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mode, setMode] = useState<"cart" | "closet">("cart");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // Try to sign in anonymously
        const { data: anonData, error: anonError } = await supabase.auth.signInWithPassword({
          email: "burks.donte@gmail.com",
          password: "testpassword",
        });
        if (anonError && anonError.message.includes("Invalid login credentials")) {
          const { error: signupError } = await supabase.auth.signUp({
            email: "burks.donte@gmail.com",
            password: "testpassword",
          });
          if (signupError) console.error("Signup error:", signupError);
        } else {
          setUser(anonData?.user);
        }
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadMedia = async () => {
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("slot", { ascending: true });
      if (error) console.error("Error fetching media:", error);
      else setMedia(data || []);
    };
    loadMedia();
  }, []);

  const countdownTarget = new Date();
  countdownTarget.setDate(countdownTarget.getDate() + 7);

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <main
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        background: "#0d1117",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {/* Left Panel */}
      <div style={{ flex: 1, background: "#161b22", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Your Coins</h2>
        {/* You can place your coins list component here */}
        <div style={{ color: "#999" }}>Coins and Buy Flow Here</div>
      </div>

      {/* Center Panel */}
      <div style={{ flex: 2, background: "#161b22", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Immersive View</h2>
          <button
            onClick={() => setMode(mode === "cart" ? "closet" : "cart")}
            style={{
              background: "#0af",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            Toggle to {mode === "cart" ? "Closet" : "Cart"}
          </button>
        </div>
        {mode === "cart" ? (
          <GravityScene mode="cart" />
        ) : (
          <AvatarClothingSelector />
        )}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {DEPARTMENTS.map((department) => {
          const departmentMedia = media.filter(
            (m) => m.department?.toLowerCase() === department.toLowerCase()
          );
          const isArt = department === "Art";
          return (
            <div
              key={department}
              style={{
                background: "#161b22",
                borderRadius: 12,
                padding: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{department}</h3>
                {isArt ? (
                  <button
                    onClick={() => router.push("/business/art")}
                    style={{
                      background: "#0af",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      color: "#fff",
                      fontSize: 14,
                    }}
                  >
                    Explore
                  </button>
                ) : (
                  <Countdown targetDate={countdownTarget} />
                )}
              </div>
              <BusinessCarousel department={department} media={departmentMedia} />
            </div>
          );
        })}
      </div>
    </main>
  );
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div style={{ fontSize: 13, color: "#9ae6b4" }}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
}

function calculateTimeLeft(targetDate: Date) {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
}
