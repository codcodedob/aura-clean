"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CoinCard from "@/components/CoinCard";
import BusinessCarousel from "@/components/BusinessCarousel";
import GravityScene from "@/components/GravityScene";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import MotionSection from "@/components/MotionSection";
import MotionCard from "@/components/MotionCard";

type Coin = {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  img_url?: string;
  tagline?: string;
  rarity?: string;
  active?: boolean;
  visible?: boolean;
};

type DepartmentMedia = {
  id: string;
  department: string;
  title: string;
  description?: string;
  img_url?: string;
  video_url?: string;
  link_url?: string;
};

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinAmounts, setCoinAmounts] = useState<{ [coinId: string]: number }>({});
  const [media, setMedia] = useState<DepartmentMedia[]>([]);
  const [activePanel, setActivePanel] = useState<"coins" | "center" | "departments">("coins");
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load coins
  useEffect(() => {
    const fetchCoins = async () => {
      const { data, error } = await supabase
        .from("aura_coins")
        .select("*")
        .eq("visible", true)
        .order("created_at", { ascending: true });
      if (error) console.error("Error fetching coins:", error);
      else {
        setCoins(data);
        const amounts: { [id: string]: number } = {};
        data.forEach((c) => (amounts[c.id] = Math.max(0.5, c.price)));
        setCoinAmounts(amounts);
      }
    };
    fetchCoins();
  }, []);

  // Load department media
  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("slot", { ascending: true });
      if (error) console.error("Error fetching media:", error);
      else setMedia(data);
    };
    fetchMedia();
  }, []);

  const handleAmountChange = (coinId: string, amount: number) => {
    setCoinAmounts((prev) => ({ ...prev, [coinId]: amount }));
  };

  const handleBuy = (coinId: string, amount: number) => {
    alert(`Pretend-buying ${amount} of coin ${coinId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#0c0c0c",
        color: "#fff",
      }}
    >
      {/* Header with Logout */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem",
          borderBottom: "1px solid #222",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            background: "#444",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Mobile panel toggle */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            padding: "0.75rem",
            background: "#111",
            borderBottom: "1px solid #222",
          }}
        >
          <button onClick={() => setActivePanel("coins")}>Coins</button>
          <button onClick={() => setActivePanel("center")}>3D Scene</button>
          <button onClick={() => setActivePanel("departments")}>Departments</button>
        </div>
      )}

      {/* Panels */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: isMobile ? "column" : "row",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        {/* Left: Coins */}
        <div
          style={{
            flex: 1,
            display: !isMobile || activePanel === "coins" ? "block" : "none",
          }}
        >
          <MotionSection>
            {coins.map((coin) => (
              <MotionCard key={coin.id} title={`${coin.emoji ?? "🪙"} ${coin.name}`}>
                <CoinCard
                  coin={coin}
                  amount={coinAmounts[coin.id]}
                  onAmountChange={handleAmountChange}
                  onBuy={handleBuy}
                />
              </MotionCard>
            ))}
          </MotionSection>
        </div>

        {/* Center: 3D Scene */}
        <div
          style={{
            flex: 2,
            display: !isMobile || activePanel === "center" ? "block" : "none",
          }}
        >
          <GravityScene mode="closet" />
          <AvatarClothingSelector />
        </div>

        {/* Right: Departments */}
        <div
          style={{
            flex: 1,
            display: !isMobile || activePanel === "departments" ? "block" : "none",
          }}
        >
          <MotionSection>
            {["art", "business", "technology"].map((dept) => (
              <MotionCard key={dept} title={dept.toUpperCase()}>
                <BusinessCarousel
                  department={dept}
                  media={media.filter((m) => m.department === dept)}
                />
              </MotionCard>
            ))}
          </MotionSection>
        </div>
      </div>
    </main>
  );
}
