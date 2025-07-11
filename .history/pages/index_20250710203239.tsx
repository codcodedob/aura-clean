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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<AuraCoin[]>([]);
  const [media, setMedia] = useState<DepartmentMedia[]>([]);
  const [mode, setMode] = useState<"cart" | "closet">("cart");

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // fallback login or signup for admin email (demo)
        const { data: anonData, error: anonError } = await supabase.auth.signInWithPassword({
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
      setLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchCoins() {
      const { data, error } = await supabase
        .from("aura_coins")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching coins:", error);
      } else {
        // Convert price and projected_cap to number if they come as string (from Postgres numeric)
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

  if (loading) return <div className="text-white p-8">Loading...</div>;

  // countdown target example
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
      {/* Left Panel: Your Coins */}
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
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Your Coins</h2>
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
              onClick={() => {
                /* maybe show coin details or buy */
                console.log("Clicked coin:", coin.name);
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 24 }}>{coin.emoji || "🪙"}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{coin.name || "Unnamed Coin"}</div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>
                    Price: ${coin.price.toFixed(2)} | Cap: {coin.cap}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
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
