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
