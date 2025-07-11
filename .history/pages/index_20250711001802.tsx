import React, { useEffect, useState, Suspense, lazy } from "react";
import { useRouter } from "next/router";
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
import { toast } from "react-hot-toast";



const ADMIN_EMAIL = "burks.donte@gmail.com";

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
      padding: "1.2rem 1.5rem",
      borderRadius: 12,
      border: "1.5px solid rgba(34, 44, 58, 0.8)",
      background: "var(--card-bg)",
      color: "var(--text-color)",
      textAlign: "center",
      boxShadow: "0 3px 18px rgba(10, 243, 255, 0.2)",
      minHeight: 140,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      userSelect: 'none'
    }}>
      <strong style={{ fontSize: 22, marginBottom: 6, userSelect: 'text' }}>
        {coin.emoji ?? "🪙"} {coin.name}
      </strong>
      <p style={{ opacity: 0.85, margin: "4px 0 12px 0", userSelect: 'text' }}>
        ${coin.price.toFixed(2)} · cap {coin.cap.toLocaleString()}
      </p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{
          marginTop: 4,
          padding: "10px 14px",
          width: "85%",
          maxWidth: 280,
          alignSelf: "center",
          borderRadius: 8,
          border: "1.5px solid #222c",
          background: "var(--input-bg)",
          color: "var(--text-color)",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          outlineOffset: 2,
          outlineColor: "transparent",
          transition: "outline-color 0.2s ease"
        }}
        onFocus={(e) => e.currentTarget.style.outlineColor = "#0af"}
        onBlur={(e) => e.currentTarget.style.outlineColor = "transparent"}
      />
      <button
        onClick={() => onBuy(coin.id)}
        style={{
          marginTop: 14,
          padding: "12px 22px",
          borderRadius: 14,
          background: "#2563eb",
          color: "#fff",
          fontWeight: "700",
          fontSize: 16,
          border: "none",
          cursor: "pointer",
          userSelect: 'none',
          boxShadow: "0 0 10px #2563ebaa",
          transition: "background-color 0.3s ease"
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
        aria-label={`Buy ${coin.name}`}
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

  const refreshMarketData = async () => {
    setRefreshing(true);
    setMessage("Refreshing market data...");
    try {
      const res = await fetch("https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins", { method: "POST" });
      const text = await res.text();
      setMessage(res.ok ? `✅ Refreshed: ${text}` : `❌ Failed: ${text}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error occurred while refreshing.");
    } finally {
      setRefreshing(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--card-bg", darkMode ? "#1f2937" : "#fff");
    document.documentElement.style.setProperty("--text-color", darkMode ? "#f9fafb" : "#1a1a1a");
    document.documentElement.style.setProperty("--input-bg", darkMode ? "#374151" : "#f3f4f6");
    document.body.style.backgroundColor = darkMode ? "#111827" : "#f9fafb";
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    fetch("/api/coins")
      .then((res) => res.json())
      .then((data) => {
        setCoins(data || []);
        // 👇 set default amounts
        const initialAmounts: { [key: string]: number } = {};
        for (const coin of data || []) {
          initialAmounts[coin.id] = coin.price;
        }
        setInvestmentAmounts(initialAmounts);
      });
  }, []);
  
  
  const [departmentMedia, setDepartmentMedia] = useState<any[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error loading media:", error);
      } else {
        setDepartmentMedia(data || []);
      }
    };
  
    fetchMedia();
  }, []);
  
  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0;
    const userData = await supabase.auth.getUser();
    const userId = userData.data.user?.id;
    if (!userId) {
      alert("You must be signed in to purchase.");
      return;
    }

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinId, amount, userId }),
    });

    const text = await res.text();
    console.log("⚠️ Raw response text:", text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON parsing failed", err);
      alert("Response was not valid JSON.");
      return;
    }

    console.log("✅ Parsed JSON:", json);

    if (!json.sessionId) {
      console.error("❌ sessionId is missing in API response");
      //alert("Please update the price to buy.");
      //showToast("Please update the price to buy.");
      toast.error("Update the price to buy.");
      return;
    }

    const stripeModule = await import("@stripe/stripe-js");
    const stripePromise = stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    await stripe.redirectToCheckout({
      sessionId: json.sessionId,
    });
  };

  const filteredCoins = coins.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? "").includes(search);
    const matchesType = filter === "all" || c.type === filter;
    return matchesSearch && matchesType;
  });
  const othersCoins = filteredCoins.filter((c) => c.user_id !== user?.id);
  const featuredCoin = filteredCoins.find((c) => c.is_featured);

  const toggleMode = () => {
    setMode((prev) => (prev === "focused" ? "full-body" : "focused"));
    setAvatarKey((prev) => prev + 1);
  };

  if (!hasMounted) return null;

  return (
    <div style={{
      display: windowWidth < 800 ? "block" : "flex",
      height: "100vh",
      flexDirection: windowWidth < 800 ? "column" : "row",
      background: "linear-gradient(120deg, #181825 40%, #111827 100%)",
      color: "var(--text-color)"
    }}>
      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          background: "#181825",
          padding: "12px 0",
          borderBottom: "1.5px solid #222"
        }}>
          <button
            onClick={() => setActivePanel("left")}
            style={{
              color: activePanel === "left" ? "#0af" : "#ccc",
              fontWeight: "700",
              fontSize: 16,
              flex: 1,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              userSelect: "none",
            }}
          >
            Coins
          </button>
          <button
            onClick={() => setActivePanel("center")}
            style={{
              color: activePanel === "center" ? "#0af" : "#ccc",
              fontWeight: "700",
              fontSize: 16,
              flex: 1,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              userSelect: "none",
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setActivePanel("right")}
            style={{
              color: activePanel === "right" ? "#0af" : "#ccc",
              fontWeight: "700",
              fontSize: 16,
              flex: 1,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              userSelect: "none",
            }}
          >
            Suite
          </button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div style={{
          flex: 1,
          padding: 24,
          overflow: "hidden",
          display: windowWidth < 800 && activePanel !== "left" ? "none" : "block",
          background: "rgba(24,24,37,0.98)",
          borderRight: "1.5px solid #222c"
        }}>
          <div style={{ height: "100%" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins"
              style={{
                padding: 14,
                borderRadius: 8,
                width: "100%",
                marginBottom: 16,
                border: "1.5px solid #222",
                background: "#232a39",
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                outline: "none",
                userSelect: "text"
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <div style={{ marginBottom: 16, userSelect: "none" }}>
              <button
                onClick={() => setFilter("all")}
                style={{
                  marginRight: 10,
                  color: filter === "all" ? "#0af" : "#888",
                  fontWeight: filter === "all" ? "700" : "500",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  padding: "6px 14px",
                  borderRadius: 8,
                  userSelect: "none",
                }}
                aria-pressed={filter === "all"}
              >
                All
              </button>
              <button
                onClick={() => setFilter("stock")}
                style={{
                  marginRight: 10,
                  color: filter === "stock" ? "#0af" : "#888",
                  fontWeight: filter === "stock" ? "700" : "500",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  padding: "6px 14px",
                  borderRadius: 8,
                  userSelect: "none",
                }}
                aria-pressed={filter === "stock"}
              >
                Stocks
              </button>
              <button
                onClick={() => setFilter("crypto")}
                style={{
                  color: filter === "crypto" ? "#0af" : "#888",
                  fontWeight: filter === "crypto" ? "700" : "500",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  padding: "6px 14px",
                  borderRadius: 8,
                  userSelect: "none",
                }}
                aria-pressed={filter === "crypto"}
              >
                Crypto
              </button>
            </div>
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List
                  height={height}
                  itemCount={othersCoins.length + (featuredCoin ? 1 : 0)}
                  itemSize={210}
                  width={width}
                >
                  {({ index, style }) => {
                    const coin =
                      index === 0 && featuredCoin
                        ? featuredCoin
                        : othersCoins[index - (featuredCoin ? 1 : 0)];
                    return (
                      <div style={style} key={coin.id}>
                        <CoinCard
                          coin={coin}
                          amount={investmentAmounts[coin.id] || coin.price}
                          onAmountChange={(id, amt) => setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))}
                          onBuy={handleBuy}
                        />
                      </div>
                    );
                  }}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div style={{
          flex: 1.1,
          padding: 24,
          display: windowWidth < 800 && activePanel !== "center" ? "none" : "block",
          background: "rgba(28,34,49,0.99)",
          position: "relative",
          overflowY: "auto"
        }}>
          {/* --- CART/CLOSET TOGGLE BUTTON --- */}
          <button
            onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
            style={{
              position: "absolute",
              top: 18,
              right: 32,
              zIndex: 22,
              background: "#18181b",
              color: "#f3ba2f",
              fontWeight: 900,
              fontFamily: "monospace",
              fontSize: 20,
              border: "2.5px solid #ffe14a",
              borderRadius: 16,
              padding: "12px 32px",
              boxShadow: "0 4px 24px #0af4, 0 2px 18px #ffe14a40",
              letterSpacing: "0.22em",
              transition: "background 0.22s, color 0.22s",
              cursor: "pointer",
              userSelect: "none"
            }}
            title="Toggle 3D Cart & Closet"
            aria-label="Toggle 3D Cart and Closet view"
          >
            C.A.RT
          </button>
          {/* --- 3D MAGNETIC SCENE --- */}
          <div
            style={{
              height: 440,
              width: "100%",
              margin: "0 auto 20px",
              borderRadius: 16,
              boxShadow: "0 0 30px #0af3",
              overflow: "hidden",
              userSelect: "none"
            }}
          >
            <GravityScene mode={sceneMode} />
          </div>

          <AvatarClothingSelector />

          {/* AUTH PANEL */}
          {!user ? (
            <div
              style={{
                background: "#181825",
                padding: 28,
                borderRadius: 14,
                marginTop: 24,
                boxShadow: "0 0 30px #0af",
                maxWidth: 400,
                marginLeft: "auto",
                marginRight: "auto",
                color: "#fff",
                userSelect: "text"
              }}
            >
              {/* SIGNUP/LOGIN FORM WOULD GO HERE */}
              {/* I assume you had more code after this in your original */}
              <p>{/* AUTH PANEL */}
{!user ? (
  <div
    style={{
      background: "#181825",
      padding: 28,
      borderRadius: 14,
      marginTop: 24,
      boxShadow: "0 0 30px #0af",
      maxWidth: 400,
      marginLeft: "auto",
      marginRight: "auto",
      color: "#fff",
      userSelect: "text"
    }}
  >
    <h3 style={{ marginBottom: 16 }}>Sign In / Sign Up</h3>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert(error.message);
        } else {
          setUser(data.user);
          router.reload();
        }
      }}
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 8,
          border: "1.5px solid #333",
          marginBottom: 10,
          background: "#232a39",
          color: "#fff",
          fontSize: 16
        }}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 8,
          border: "1.5px solid #333",
          marginBottom: 16,
          background: "#232a39",
          color: "#fff",
          fontSize: 16
        }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          background: "#2563eb",
          color: "#fff",
          fontWeight: "700",
          border: "none",
          cursor: "pointer"
        }}
      >
        Sign In
      </button>
    </form>
    <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
      No account?{" "}
      <button
        onClick={async () => {
          const email = prompt("Enter email to sign up:");
          if (!email) return;
          const password = prompt("Enter password:");
          if (!password) return;
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) {
            alert(error.message);
          } else {
            alert("Check your email for the confirmation link.");
          }
        }}
        style={{
          color: "#0af",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Create one
      </button>
    </p>
  </div>
) : (
  <>
    {/* Show user info */}
  </>
)}
</p>
            </div>
          ) : (
            <>
              {/* Show user info, logout button, etc */}
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 16,
                  fontWeight: 600,
                  color: "#eee",
                  userSelect: "text"
                }}
              >
                Welcome, {user.email}
                <br />
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    router.reload();
                  }}
                  style={{
                    marginTop: 12,
                    padding: "10px 22px",
                    borderRadius: 14,
                    background: "#f87171",
                    color: "#fff",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                    userSelect: "none",
                    boxShadow: "0 0 10px #f87171aa"
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* RIGHT PANEL */}
     {(windowWidth >= 800 || activePanel === "right") && (
  <div
    style={{
      flex: 1,
      padding: 24,
      background: "rgba(24,24,37,0.98)",
      borderLeft: "1.5px solid #222c",
      display: windowWidth < 800 && activePanel !== "right" ? "none" : "block",
      overflowY: "auto",
      userSelect: "text"
    }}
  ><div
  style={{
    flex: 1,
    padding: 24,
    background: "rgba(24,24,37,0.98)",
    borderLeft: "1.5px solid #222c",
    display: windowWidth < 800 && activePanel !== "right" ? "none" : "block",
    overflowY: "auto",
    userSelect: "text",
  }}
>
  {/* Business Carousel */}
  <BusinessCarousel department="marketing" />

  {/* Countdown Cards */}
  <div style={{ marginTop: 32, display: "grid", gap: 20 }}>
    {/* Example Countdown Card 1 */}
    <div
      style={{
        background: "#191c24",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 0 12px #0af3",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 18, color: "#fff" }}>
        Limited Offer: Business Starter Pack
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: "#9ae6b4" }}>
        Expires in: <strong>02:15:42</strong>
      </div>
      <button
        onClick={() => router.push("/business")}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          borderRadius: 10,
          background: "#2563eb",
          color: "#fff",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          userSelect: "none",
          boxShadow: "0 0 8px #2563ebaa",
        }}
      >
        Explore Starter Pack
      </button>
    </div>

    {/* Example Countdown Card 2 */}
    <div
      style={{
        background: "#191c24",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 0 12px #0af3",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 18, color: "#fff" }}>
        Featured Service: Pro Marketing Boost
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: "#9ae6b4" }}>
        Expires in: <strong>06:48:10</strong>
      </div>
      <button
        onClick={() => router.push("/business")}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          borderRadius: 10,
          background: "#10b981",
          color: "#fff",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          userSelect: "none",
          boxShadow: "0 0 8px #10b981aa",
        }}
      >
        View Marketing Boost
      </button>
    </div>
  </div>

  {/* Art Explore Button */}
  <div style={{ marginTop: 32, textAlign: "center" }}>
    <button
      onClick={() => router.push("/business/art")}
      style={{
        padding: "14px 28px",
        borderRadius: 14,
        background: "#f59e0b",
        color: "#111",
        fontWeight: 800,
        fontSize: 16,
        border: "none",
        cursor: "pointer",
        userSelect: "none",
        boxShadow: "0 0 10px #f59e0baa",
      }}
    >
      🎨 Explore Art Businesses
    </button>
  </div>
</div>

    {/* ART BUTTON with Department Media */}
    <div
      style={{
        background: "#181825",
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 0 20px #0af5",
        textAlign: "center"
      }}
    >
      <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
        Featured Art
      </h3>
      <BusinessCarousel
        department="Art"
        aiPick
        media={departmentMedia.filter(
          (m) => m.department?.toLowerCase() === "art"
        )}
      />
      <button
        onClick={() => router.push("/business/art")}
        style={{
          marginTop: 16,
          padding: "12px 20px",
          borderRadius: 10,
          background: "#2563eb",
          color: "#fff",
          fontWeight: "700",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 10px #2563ebaa",
          transition: "background-color 0.3s ease"
        }}
      >
        Explore Art
      </button>
    </div>

    {/* BUSINESS CARDS with Countdown */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      {departmentMedia
        .filter((m) => m.department?.toLowerCase() === "business")
        .map((m) => {
          // Example countdown to launch date
          const launchDate = new Date(m.launch_date || "2025-12-31T00:00:00Z");
          const now = new Date();
          const timeDiff = launchDate.getTime() - now.getTime();
          const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));

          return (
            <div
              key={m.id}
              style={{
                background: "#191c24",
                borderRadius: 12,
                boxShadow: "0 2px 16px #0af2",
                padding: 16
              }}
            >
              {m.img_url && (
                <img
                  src={m.img_url}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                  alt={m.title}
                />
              )}
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {m.title}
              </div>
              <div style={{ fontSize: 13, color: "#9ae6b4", marginBottom: 6 }}>
                {m.description}
              </div>
              <div style={{ fontSize: 12, color: "#fbbf24", marginBottom: 8 }}>
                {days} days until launch
              </div>
              {m.link_url && (
                <a
                  href={m.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0af", fontSize: 14 }}
                >
                  Visit Site
                </a>
              )}
            </div>
          );
        })}
    </div>

    {/* ADMIN Refresh Button */}
    {user?.email === ADMIN_EMAIL && (
      <div style={{ marginTop: 24 }}>
        <button
          disabled={refreshing}
          onClick={refreshMarketData}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 14,
            background: refreshing ? "#555" : "#2563eb",
            color: "#fff",
            fontWeight: "700",
            fontSize: 18,
            border: "none",
            cursor: refreshing ? "not-allowed" : "pointer",
            userSelect: "none",
            boxShadow: "0 0 10px #2563ebaa",
            transition: "background-color 0.3s ease"
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh Market Data"}
        </button>
        {message && (
          <p
            style={{
              marginTop: 14,
              fontWeight: 600,
              color: message.startsWith("❌") ? "#f87171" : "#6ee7b7"
            }}
                >
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
