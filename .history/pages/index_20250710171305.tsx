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
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setUser(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.includes("Invalid login credentials")) {
        // Try signup
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setAuthError(signUpError.message);
        } else {
          setUser(signUpData.user);
        }
      } else {
        setAuthError(signInError.message);
      }
    } else {
      setUser(signInData.user);
    }

    setAuthLoading(false);
  };

  const countdownTarget = new Date();
  countdownTarget.setDate(countdownTarget.getDate() + 7);

  if (loading) return <div className="text-white p-8">Loading...</div>;

  if (!user) {
    return (
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#0d1117",
          color: "#fff",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "#161b22",
            padding: 24,
            borderRadius: 12,
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 0 12px #0af",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>Login or Create Account</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#0d1117",
              color: "#fff",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#0d1117",
              color: "#fff",
            }}
          />
          {authError && <div style={{ color: "#f66", fontSize: 14 }}>{authError}</div>}
          <button
            type="submit"
            disabled={authLoading}
            style={{
              background: "#0af",
              border: "none",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            {authLoading ? "Processing..." : "Login / Sign Up"}
          </button>
        </form>
      </main>
    );
  }

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
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {["AURA Coin", "Creator Coin", "Community Coin"].map((coin) => (
            <li
              key={coin}
              style={{
                background: "#0d1117",
                padding: 8,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{coin}</span>
              <button
                style={{
                  background: "#0af",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 13,
                }}
              >
                Buy
              </button>
            </li>
          ))}
        </ul>
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
