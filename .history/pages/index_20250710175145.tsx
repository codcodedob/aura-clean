// pages/index.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CoinCard from "@/components/CoinCard";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import GravityScene from "@/components/GravityScene";
import BusinessCarousel from "@/components/BusinessCarousel";

type User = {
  id: string;
  email: string | null;
};

type Coin = {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  user_id: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinAmounts, setCoinAmounts] = useState<Record<string, number>>({});
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentMedia, setDepartmentMedia] = useState<Record<string, DepartmentMedia[]>>({});
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");

  // Auth session management for Supabase v2
  useEffect(() => {
    let subscription: any;

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

  // Fetch user coins on login
  useEffect(() => {
    if (!user) {
      setCoins([]);
      setCoinAmounts({});
      return;
    }
    async function fetchCoins() {
      const { data, error } = await supabase
        .from<Coin>("aura_coins")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching coins:", error);
        setCoins([]);
      } else {
        setCoins(data ?? []);
        // Initialize coinAmounts with 0
        const initAmounts: Record<string, number> = {};
        (data ?? []).forEach((coin) => {
          initAmounts[coin.id] = 0;
        });
        setCoinAmounts(initAmounts);
      }
    }
    fetchCoins();
  }, [user]);

  // Fetch all department names and media
  useEffect(() => {
    async function fetchDepartmentMedia() {
      const { data, error } = await supabase
        .from<DepartmentMedia>("department_media")
        .select("*");
      if (error) {
        console.error("Error fetching department media:", error);
        setDepartments([]);
        setDepartmentMedia({});
      } else {
        // group media by department
        const grouped: Record<string, DepartmentMedia[]> = {};
        data?.forEach((item) => {
          if (!grouped[item.department]) grouped[item.department] = [];
          grouped[item.department].push(item);
        });
        setDepartments(Object.keys(grouped));
        setDepartmentMedia(grouped);
      }
    }
    fetchDepartmentMedia();
  }, []);

  // Handle buy button clicked in coin card
  function handleBuy(coinId: string, amount: number) {
    alert(`You clicked buy for coin ${coinId} amount $${amount.toFixed(2)}. Implement checkout flow.`);
    // Here you'd call your checkout API or redirect user to Stripe checkout
  }

  // Handle amount change in coin card input
  function handleAmountChange(coinId: string, amount: number) {
    setCoinAmounts((prev) => ({ ...prev, [coinId]: amount }));
  }

  // Login form (simplified)
  async function handleLogin(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }

  // Logout handler
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // Responsive panel toggle buttons (shown only if screen width < 800)
  // This uses window.innerWidth - for production consider useMediaQuery or CSS media queries

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 800);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        style={{
          background: "#121212",
          color: "#0af",
          padding: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div>My App Home</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <>
              <div>{user.email}</div>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#0af",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div>Please log in</div>
          )}
        </div>
      </header>

      {/* Panel toggles for mobile */}
      {isMobile && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, margin: 12 }}>
          <button
            onClick={() => setActivePanel("left")}
            style={{
              padding: "6px 12px",
              backgroundColor: activePanel === "left" ? "#0af" : "#333",
              color: activePanel === "left" ? "#000" : "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Coins
          </button>
          <button
            onClick={() => setActivePanel("center")}
            style={{
              padding: "6px 12px",
              backgroundColor: activePanel === "center" ? "#0af" : "#333",
              color: activePanel === "center" ? "#000" : "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            3D Scenes
          </button>
          <button
            onClick={() => setActivePanel("right")}
            style={{
              padding: "6px 12px",
              backgroundColor: activePanel === "right" ? "#0af" : "#333",
              color: activePanel === "right" ? "#000" : "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Departments
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 16,
          padding: 12,
          height: "calc(100vh - 72px)",
          overflow: "hidden",
        }}
      >
        {/* Left Panel - Coins */}
        <aside
          style={{
            flex: isMobile ? (activePanel === "left" ? 1 : 0) : 1,
            overflowY: "auto",
            background: "#111",
            borderRadius: 12,
            padding: 12,
            display: isMobile && activePanel !== "left" ? "none" : "block",
          }}
        >
          <h2 style={{ color: "#0af" }}>Your Coins</h2>
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

        {/* Center Panel - 3D Scenes */}
        <main
          style={{
            flex: isMobile ? (activePanel === "center" ? 2 : 0) : 2,
            background: "#151a21",
            borderRadius: 12,
            padding: 12,
            overflow: "auto",
            display: isMobile && activePanel !== "center" ? "none" : "block",
          }}
        >
          <h2 style={{ color: "#0af", marginBottom: 12 }}>3D Scenes</h2>
          <AvatarClothingSelector />
          <GravityScene mode="closet" />
          {/* You can add a Cart scene or toggle if you want */}
        </main>

        {/* Right Panel - Departments */}
        <aside
          style={{
            flex: isMobile ? (activePanel === "right" ? 1 : 0) : 1,
            overflowY: "auto",
            background: "#111",
            borderRadius: 12,
            padding: 12,
            display: isMobile && activePanel !== "right" ? "none" : "block",
          }}
        >
          <h2 style={{ color: "#0af" }}>Departments</h2>
          {departments.length === 0 ? (
            <div>No departments found.</div>
          ) : (
            departments.map((dept) => (
              <div key={dept} style={{ marginBottom: 24 }}>
                <button
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    background: "#222",
                    color: "#0af",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    marginBottom: 8,
                    fontWeight: "bold",
                  }}
                  onClick={() =>
                    alert(`Navigate to /departments/${dept} (implement routing)`)
                  }
                >
                  {dept.toUpperCase()}
                  {/* Optionally add countdown or badge here */}
                </button>
                {/* Show carousel filtered by department */}
                <BusinessCarousel
                  department={dept}
                  media={departmentMedia[dept] || []}
                />
              </div>
            ))
          )}
        </aside>
      </div>
    </>
  );
}
