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
