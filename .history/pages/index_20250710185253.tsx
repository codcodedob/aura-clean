"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import BusinessCarousel from "@/components/BusinessCarousel";
import GravityScene from "@/components/GravityScene";
import { User } from "@supabase/supabase-js";
import { loadStripe } from "@stripe/stripe-js";
import { Info } from "lucide-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession } from "@supabase/auth-helpers-react";

const ADMIN_EMAIL = "burks.donte@gmail.com";

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

type AuraCoin = {
  id: string;
  user_id: string | null;
  name: string | null;
  price: number;
  cap: number;
  created_at: string;
  updated_at: string;
  emoji?: string;
  visible?: boolean;
  rarity?: string;
  owner_name?: string;
  tagline?: string;
  vision?: string;
  projected_cap?: number;
  dividend_eligible?: boolean;
  earnings_model?: string;
  img_Url?: string;
  is_featured?: boolean;
  type?: string;
  symbol?: string;
  scope?: string;
  active?: boolean;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function Home() {
  const router = useRouter();

  // Auth & User State
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Data states
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [auraCoins, setAuraCoins] = useState<AuraCoin[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // UI states
  const [mode, setMode] = useState<"cart" | "closet">("cart");
  const [buyingCoinId, setBuyingCoinId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } else {
        setUser(data.user);
      }
      setLoadingUser(false);
    };
    fetchUser();

    // Subscribe to auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch department media
  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("slot", { ascending: true });
      if (error) {
        console.error("Error loading department media:", error);
      } else {
        setMedia(data || []);
      }
    };
    fetchMedia();
  }, []);

  // Fetch aura coins for user (or all visible coins)
  useEffect(() => {
    const fetchAuraCoins = async () => {
      setLoadingCoins(true);
      const { data, error } = await supabase
        .from("aura_coins")
        .select("*")
        .or(`user_id.eq.${user?.id},visible.eq.true`)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching Aura Coins:", error);
        setAuraCoins([]);
      } else {
        setAuraCoins(data || []);
      }
      setLoadingCoins(false);
    };
    fetchAuraCoins();
  }, [user]);

  // Sign in function - you can replace with your own UI or social login
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "github" });
    if (error) console.error("Sign in error:", error);
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Stripe checkout session creation and redirect
  const handleBuyCoin = useCallback(
    async (coin: AuraCoin) => {
      if (!user) {
        alert("You must be logged in to purchase a coin.");
        return;
      }
      setBuyingCoinId(coin.id);
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coinId: coin.id, userId: user.id }),
        });
        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        if (!stripe) {
          alert("Stripe failed to load.");
          setBuyingCoinId(null);
          return;
        }
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Stripe redirect error:", error);
        }
      } catch (err) {
        console.error("Error during Stripe checkout:", err);
      }
      setBuyingCoinId(null);
    },
    [user]
  );

  if (loadingUser || loadingCoins) return <div className="text-white p-8">Loading...</div>;

  return (
    <main
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        background: "#0d1117",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {/* Left Panel - Aura Coins with Buy Flow */}
      <div
        style={{
          flex: 1,
          background: "#161b22",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Your Coins</h2>
          {user ? (
            <button
              onClick={signOut}
              style={{
                background: "#e53e3e",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={signIn}
              style={{
                background: "#38a169",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Login
            </button>
          )}
        </div>
        {/* Aura Coins List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {auraCoins.length === 0 && (
            <div style={{ color: "#999", textAlign: "center" }}>
              No coins available. Please check back later.
            </div>
          )}

          {auraCoins.map((coin) => (
            <div
              key={coin.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#21262d",
                padding: 12,
                borderRadius: 8,
                cursor: "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{coin.emoji || "🪙"}</span>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      color: coin.active ? "#9ae6b4" : "#ccc",
                    }}
                  >
                    {coin.name || "Unnamed Coin"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Price: ${coin.price?.toFixed(2) || "N/A"} | Cap: {coin.cap || 0}
                  </div>
                </div>
              </div>

              <button
                disabled={buyingCoinId === coin.id}
                onClick={() => handleBuyCoin(coin)}
                style={{
                  background: "#0af",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  color: "#fff",
                  cursor: buyingCoinId === coin.id ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  minWidth: 80,
                }}
              >
                {buyingCoinId === coin.id ? "Processing..." : "Buy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - Immersive View & Avatar */}
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
            alignItems: "center",
            marginBottom: 12,
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
              fontWeight: "bold",
            }}
          >
            Switch to {mode === "cart" ? "Closet" : "Cart"}
          </button>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {mode === "cart" ? <GravityScene mode="cart" /> : <AvatarClothingSelector />}
        </div>
      </div>

      {/* Right Panel - Departments & Business Access */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
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
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                  {department}
                </h3>

                {isArt && user ? (
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
                      fontWeight: "bold",
                    }}
                  >
                    Business Access
                  </button>
                ) : (
                  <Countdown targetDate={getOneWeekFromNow()} />
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

// Helper to get countdown target date 1 week from now
function getOneWeekFromNow() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}


export default function Home() {
  const session = useSession();
  const router = useRouter();

  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [session]);

  const countdownTarget = React.useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    return target;
  }, []);

  function AuthControls() {
    if (loading) {
      return <div style={{ color: "#ccc" }}>Loading auth...</div>;
    }
    if (user) {
      return (
        <div
          style={{
            marginBottom: 16,
            color: "#ccc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Welcome, {user.email}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
              router.refresh();
            }}
            style={{
              background: "#ff4d4f",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Log Out
          </button>
        </div>
      );
    }
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={[]}
        socialLayout="horizontal"
        view="sign_in"
      />
    );
  }

  return (
    <>
      {/* Fixed auth box */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 1000,
          width: 300,
          background: "#0d1117",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}
      >
        <AuthControls />
      </div>

      {/* Place your panels and rest of UI here */}
      <main
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          background: "#0d1117",
          minHeight: "100vh",
          color: "#fff",
          marginTop: 70, // To prevent overlap with fixed auth
        }}
      >
        {/* Your Left, Center, Right Panels go here */}
      </main>
    </>
  );
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft(targetDate));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div style={{ fontSize: 13, color: "#9ae6b4", userSelect: "none" }}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
}

function calculateTimeLeft(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
