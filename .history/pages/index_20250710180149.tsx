import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CoinCard from "@/components/CoinCard";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import GravityScene from "@/components/GravityScene";
import BusinessCarousel from "@/components/BusinessCarousel";

export default function Home() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [coinAmounts, setCoinAmounts] = useState({});
  const [departments, setDepartments] = useState([]);
  const [departmentMedia, setDepartmentMedia] = useState({});
  const [activePanel, setActivePanel] = useState("center");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let subscription;

    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }

    getSession();

    subscription = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 800);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!user) {
      setCoins([]);
      setCoinAmounts({});
      return;
    }
    async function fetchCoins() {
      const { data } = await supabase
        .from("aura_coins")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      setCoins(data ?? []);
      const initAmounts = {};
      (data ?? []).forEach((coin) => {
        initAmounts[coin.id] = 0;
      });
      setCoinAmounts(initAmounts);
    }
    fetchCoins();
  }, [user]);

  useEffect(() => {
    async function fetchDepartmentMedia() {
      const { data } = await supabase.from("department_media").select("*");
      const grouped = {};
      data?.forEach((item) => {
        if (!grouped[item.department]) grouped[item.department] = [];
        grouped[item.department].push(item);
      });
      setDepartments(Object.keys(grouped));
      setDepartmentMedia(grouped);
    }
    fetchDepartmentMedia();
  }, []);

  function handleBuy(coinId, amount) {
    alert(`You clicked buy for coin ${coinId} amount $${amount.toFixed(2)}`);
  }

  function handleAmountChange(coinId, amount) {
    setCoinAmounts((prev) => ({ ...prev, [coinId]: amount }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <>
      <header style={{ background: "#121212", color: "#0af", padding: 12, display: "flex", justifyContent: "space-between" }}>
        <div>My App Home</div>
        <div style={{ display: "flex", gap: 12 }}>
          {user ? (
            <>
              <div>{user.email}</div>
              <button onClick={handleLogout} style={{ background: "#0af", border: "none", padding: "6px 12px", borderRadius: 6 }}>Logout</button>
            </>
          ) : (
            <div>Please log in</div>
          )}
        </div>
      </header>

      {isMobile && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, margin: 12 }}>
          <button onClick={() => setActivePanel("left")} style={{ backgroundColor: activePanel === "left" ? "#0af" : "#333" }}>Coins</button>
          <button onClick={() => setActivePanel("center")} style={{ backgroundColor: activePanel === "center" ? "#0af" : "#333" }}>3D</button>
          <button onClick={() => setActivePanel("right")} style={{ backgroundColor: activePanel === "right" ? "#0af" : "#333" }}>Departments</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, padding: 12, height: "calc(100vh - 72px)" }}>
        <aside style={{ flex: isMobile ? (activePanel === "left" ? 1 : 0) : 1, display: isMobile && activePanel !== "left" ? "none" : "block" }}>
          <h2>Your Coins</h2>
          {!user ? (
            <div>Please log in to see your coins.</div>
          ) : coins.length === 0 ? (
            <div>No coins found for your account.</div>
          ) : (
            coins.map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                amount={coinAmounts[coin.id] || 0}
                onAmountChange={handleAmountChange}
                onBuy={handleBuy}
              />
            ))
          )}
        </aside>

        <main style={{ flex: isMobile ? (activePanel === "center" ? 2 : 0) : 2, display: isMobile && activePanel !== "center" ? "none" : "block" }}>
          <h2>3D Scenes</h2>
          <AvatarClothingSelector />
          <GravityScene mode="closet" />
        </main>

        <aside style={{ flex: isMobile ? (activePanel === "right" ? 1 : 0) : 1, display: isMobile && activePanel !== "right" ? "none" : "block" }}>
          <h2>Departments</h2>
          {departments.map((dept) => (
            <div key={dept}>
              <button style={{ width: "100%", background: "#222", color: "#0af", marginBottom: 8 }}>{dept.toUpperCase()}</button>
              <BusinessCarousel department={dept} media={departmentMedia[dept] || []} />
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
