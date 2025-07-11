"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import GravityScene from "@/components/GravityScene";
import BusinessCarousel from "@/components/BusinessCarousel";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [coins, setCoins] = useState<AuraCoin[]>([]);
  const [media, setMedia] = useState<DepartmentMedia[]>([]);
  const [mode, setMode] = useState<"cart" | "closet">("cart");
  const [buyLoading, setBuyLoading] = useState<string | null>(null); // coin id loading

  // Fetch user on mount
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setUser(null);
      } else {
        setUser(data.user);
      }
      setLoadingUser(false);
    }
    fetchUser();
  }, []);

  // Fetch Aura Coins always
  useEffect(() => {
    async function fetchCoins() {
      const { data, error } = await supabase
        .from("aura_coins")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching coins:", error);
      } else {
        const parsed = (data || []).map((c) => ({
          ...c,
          price: Number(c.price),
          projected_cap: c.projected_cap ? Number(c.projected_cap) : null,
          cap: c.cap || 0,
        })) as AuraCoin[];
        setCoins(parsed);
      }
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
      } else {
        setMedia(data || []);
      }
    }
    fetchMedia();
  }, []);

  const handleBuy = async (coin: AuraCoin) => {
    if (!user) {
      alert("Please log in to purchase.");
      return;
    }
    setBuyLoading(coin.id);
    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId: coin.id }),
      });
      const session = await response.json();
      if (session.error) {
        alert(session.error);
        setBuyLoading(null);
        return;
      }
      if (stripe && session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Error starting checkout.");
    }
    setBuyLoading(null);
  };

  if (loadingUser) return <div className="text-white p-8">Loading user...</div>;

  // Countdown target example for department panel
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
      {/* Left Panel: Aura Coins */}
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
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Aura Coins</h2>
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
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 24 }}>{coin.emoji || "🪙"}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{coin.name || "Unnamed Coin"}</div>
                    <div style={{ fontSize: 13, color: "#aaa" }}>
                      Price: ${coin.price.toFixed(2)} | Cap: {coin.cap}
                    </div>
                  </div>
                </div>
                <button
                  disabled={buyLoading === coin.id}
                  onClick={() => handleBuy(coin)}
                  style={{
                    background: buyLoading === coin.id ? "#555" : "#0af",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    cursor: buyLoading === coin.id ? "not-allowed" : "pointer",
                    color: "#fff",
                    fontWeight: "bold",
                    userSelect: "none",
                  }}
                >
                  {buyLoading === coin.id ? "Processing..." : "Buy"}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Center Panel: Immersive View or AuthPanel */}
      <div
        style={{
          flex: 2,
          background: "#161b22",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
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
              disabled={!user}
              title={!user ? "Log in to use immersive view" : ""}
            >
              Toggle to {mode === "cart" ? "Closet" : "Cart"}
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {user ? (mode === "cart" ? <GravityScene mode="cart" /> : <AvatarClothingSelector />) : (
              <div style={{ color: "#aaa", padding: 16 }}>
                Please log in below to access immersive features.
              </div>
            )}
          </div>
        </div>

        {/* Auth panel at bottom if not logged in */}
        {!user && (
          <div style={{ marginTop: 16 }}>
            <AuthPanel />
          </div>
        )}
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

// AuthPanel component (login/signup)
function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your email for confirmation link.");
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else window.location.reload();
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 320,
        margin: "auto",
        padding: "1rem",
        background: "#181818",
        borderRadius: 8,
        border: "1px solid #333",
        color: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Account</h2>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: 4 }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: 4 }}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          disabled={loading}
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
          disabled={loading}
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
      {message && (
        <p style={{ marginTop: "0.5rem", color: "#f66", fontSize: 14, userSelect: "none" }}>
          {message}
        </p>
      )}
    </div>
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
