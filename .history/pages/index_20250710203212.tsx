"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import GravityScene from "@/components/GravityScene";
import BusinessCarousel from "@/components/BusinessCarousel";
import { motion } from "framer-motion";

type AuraCoin = {
  id: string;
  user_id?: string | null;
  name?: string | null;
  price: number;
  cap: number;
  created_at: string;
  updated_at: string;
  emoji?: string | null;
  visible?: boolean | null;
  rarity?: string | null;
  owner_name?: string | null;
  tagline?: string | null;
  vision?: string | null;
  projected_cap?: number | null;
  dividend_eligible?: boolean | null;
  earnings_model?: string | null;
  img_Url?: string | null;
  is_featured?: boolean | null;
  type?: string | null;
  symbol?: string | null;
  scope?: string | null;
  active?: boolean | null;
};

type DepartmentMedia = {
  id: string;
  department?: string | null;
  slot?: number | null;
  title?: string | null;
  description?: string | null;
  img_url?: string | null;
  link_url?: string | null;
  updated_at?: string | null;
  video_url?: string | null;
};

const DEPARTMENTS = [
  "Art",
  "Entertainment",
  "Fashion",
  "Health n Fitness",
  "Science",
  "Community Clipboard",
] as const;

type Department = typeof DEPARTMENTS[number];
const ADMIN_EMAIL = "burks.donte@gmail.com";

export default function Home() {
  const router = useRouter();

  // Auth states & form
  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Data state
  const [coins, setCoins] = useState<AuraCoin[]>([]);
  const [media, setMedia] = useState<DepartmentMedia[]>([]);
  const [mode, setMode] = useState<"cart" | "closet">("cart");

  // Fetch user on mount + fallback admin login/signup
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        const { data: anonData, error: anonError } =
          await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: "testpassword",
          });
        if (anonError && anonError.message.includes("Invalid login credentials")) {
          await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: "testpassword",
          });
        } else {
          setUser(anonData?.user);
        }
      } else {
        setUser(data.user);
      }
      setLoadingUser(false);
    }
    fetchUser();
  }, []);

  // Fetch AuraCoins list
  useEffect(() => {
    async function fetchCoins() {
      const { data, error } = await supabase
        .from("aura_coins")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching coins:", error);
        return;
      }
      if (!data) return;

      const parsed: AuraCoin[] = data.map((c: any) => ({
        ...c,
        price: c.price ? Number(c.price) : 0,
        projected_cap: c.projected_cap ? Number(c.projected_cap) : null,
        cap: c.cap !== null && c.cap !== undefined ? Number(c.cap) : 0,
      }));
      setCoins(parsed);
    }
    fetchCoins();
  }, []);

  // Fetch department media
  useEffect(() => {
    async function fetchMedia() {
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("slot", { ascending: true });
      if (error) {
        console.error("Error fetching media:", error);
        return;
      }
      setMedia(data || []);
    }
    fetchMedia();
  }, []);

  if (loadingUser)
    return <div className="text-white p-8">Loading user info...</div>;

  // Auth handlers
  async function handleSignUp() {
    setAuthLoading(true);
    setAuthMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthMessage(error.message);
    else setAuthMessage("Check your email for confirmation link.");
    setAuthLoading(false);
  }

  async function handleLogin() {
    setAuthLoading(true);
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMessage(error.message);
    else window.location.reload();
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }
  // Countdown target example: 7 days from now
  const countdownTarget = new Date();
  countdownTarget.setDate(countdownTarget.getDate() + 7);

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
      {/* Left Panel: Auth / AuraCoins */}
      <div
        style={{
          flex: 1,
          background: "#161b22",
          borderRadius: 12,
          padding: 16,
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        {!user ? (
          <div>
            <h2 style={{ marginBottom: 12 }}>Account</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                borderRadius: 4,
                border: "1px solid #444",
                background: "#222",
                color: "#eee",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                borderRadius: 4,
                border: "1px solid #444",
                background: "#222",
                color: "#eee",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={authLoading}
                onClick={handleLogin}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#0af",
                  border: "none",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Login
              </button>
              <button
                disabled={authLoading}
                onClick={handleSignUp}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#555",
                  border: "none",
                  color: "#fff",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </div>
            {authMessage && (
              <p style={{ marginTop: 8, color: "#f66", fontSize: 14 }}>
                {authMessage}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <h2>Your Aura Coins</h2>
              <button
                onClick={handleLogout}
                style={{
                  background: "#a22",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                Logout
              </button>
            </div>
            {coins.length === 0 ? (
              <div style={{ color: "#999" }}>No coins found.</div>
            ) : (
              coins.map((coin) => (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: "#0c1118",
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 24 }}>{coin.emoji || "🪙"}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {coin.name || "Unnamed Coin"}
                        </div>
                        <div style={{ fontSize: 13, color: "#aaa" }}>
                          Price: ${coin.price.toFixed(2)} | Cap: {coin.cap}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Purchase flow for: ${coin.name}`)}
                      style={{
                        background: "#0af",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        color: "#000",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Center Panel: Immersive view or Avatar Closet */}
      <div
        style={{
          flex: 2,
          background: "#161b22",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            alignItems: "center",
          }}
        >
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
              userSelect: "none",
            }}
          >
            Toggle to {mode === "cart" ? "Closet" : "Cart"}
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {mode === "cart" ? <GravityScene mode="cart" /> : <AvatarClothingSelector />}
        </div>
      </div>
      {/* Right Panel: Department Media */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        {DEPARTMENTS.map((department) => {
          const deptMedia = media.filter(
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
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
                      userSelect: "none",
                    }}
                  >
                    Explore
                  </button>
                ) : (
                  <Countdown targetDate={countdownTarget} />
                )}
              </div>
              <BusinessCarousel department={department} media={deptMedia} />
            </div>
          );
        })}
      </div>
    </main>
  );
}

// Countdown component to display time left until a target date
function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div style={{ fontSize: 13, color: "#9ae6b4", userSelect: "none" }}>
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
