"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { motion } from "framer-motion";
import BusinessCarousel from "@/components/BusinessCarousel";
import { Info } from "lucide-react";
import GravityScene from "@/components/GravityScene";

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

interface Coin {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  user_id: string;
  img_url?: string;
  is_featured?: boolean;
  symbol?: string;
  type?: "stock" | "crypto";
}

const FocusedAvatar = lazy(() => import("@/components/FocusedAvatar")) as React.LazyExoticComponent<React.ComponentType<{}>>;
const FullBodyAvatar = lazy(() => import("@/components/FullBodyAvatar")) as React.LazyExoticComponent<React.ComponentType<{ modelPaths: string[] }>>;

function CoinCard({ coin, amount, onAmountChange, onBuy }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2));
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => { setLocalAmount(amount.toFixed(2)); }, [amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalAmount(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const newTimer = setTimeout(() => {
      const num = parseFloat(val);
      if (!isNaN(num)) onAmountChange(coin.id, num);
    }, 500);
    setDebounceTimer(newTimer);
  };

  return (
    <div style={{
      margin: "1rem 0",
      padding: "1rem",
      borderRadius: 8,
      border: "1px solid #222c",
      background: "var(--card-bg)",
      color: "var(--text-color)",
      textAlign: "center",
      boxShadow: "0 2px 12px #0af3",
      minHeight: 130,
      position: 'relative'
    }}>
      <strong style={{ fontSize: 20 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
      <p style={{ opacity: 0.85 }}>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{
          marginTop: 8, padding: 8, width: "80%",
          borderRadius: 6, border: "1px solid #222",
          background: "var(--input-bg)", color: "var(--text-color)",
        }}
      />
      <button
        onClick={() => onBuy(coin.id)}
        style={{
          marginTop: 12, padding: "10px 18px", borderRadius: 8,
          background: "#2563eb", color: "#fff", fontWeight: "bold",
          border: "none", cursor: "pointer"
        }}
      >
        Buy
      </button>
    </div>
  );
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({});
  const [mode, setMode] = useState<"focused" | "full-body">("focused");
  const [gridMode, setGridMode] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [signupMode, setSignupMode] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const [sceneMode, setSceneMode] = useState<"cart" | "closet">("cart");
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fullBodyModels = [
    "/models/F1VISIONBALNCICHROME.glb",
    "/models/top.glb",
    "/models/bottom.glb",
    "/models/base-inner.glb",
    "/models/base-outer.glb",
  ];

  // -- next section continues below --
