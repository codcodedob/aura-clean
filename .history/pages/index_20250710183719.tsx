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
