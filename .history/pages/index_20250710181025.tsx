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
      .then((data) => setCoins(data || []));
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
      alert("Checkout sessionId is missing.");
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
      background: "linear-gradient(120deg, #181825 40%, #111827 100%)"
    }}>
      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          background: "#181825",
          padding: 10,
          borderBottom: "1px solid #222"
        }}>
          <button onClick={() => setActivePanel("left")} style={{ color: activePanel === "left" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}>Coins</button>
          <button onClick={() => setActivePanel("center")} style={{ color: activePanel === "center" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}>Profile</button>
          <button onClick={() => setActivePanel("right")} style={{ color: activePanel === "right" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}>Suite</button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div style={{
          flex: 1,
          padding: 20,
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
              style={{ padding: 10, borderRadius: 6, width: "100%", marginBottom: 10, border: "1px solid #222", background: "#232a39", color: "#fff" }}
            />
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setFilter("all")} style={{ marginRight: 8, color: filter === "all" ? "#0af" : "#ccc" }}>All</button>
              <button onClick={() => setFilter("stock")} style={{ marginRight: 8, color: filter === "stock" ? "#0af" : "#ccc" }}>Stocks</button>
              <button onClick={() => setFilter("crypto")} style={{ color: filter === "crypto" ? "#0af" : "#ccc" }}>Crypto</button>
            </div>
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List
                  height={height}
                  itemCount={othersCoins.length + (featuredCoin ? 1 : 0)}
                  itemSize={200}
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
          flex: 1.1, padding: 20,
          display: windowWidth < 800 && activePanel !== "center" ? "none" : "block",
          background: "rgba(28,34,49,0.99)",
          position: "relative"
        }}>
          {/* --- CART/CLOSET TOGGLE BUTTON --- */}
          <button
            onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
            style={{
              position: "absolute",
              top: 16,
              right: 32,
              zIndex: 22,
              background: "#18181b",
              color: "#f3ba2f",
              fontWeight: 900,
              fontFamily: "monospace",
              fontSize: 20,
              border: "2.5px solid #ffe14a",
              borderRadius: 14,
              padding: "10px 30px",
              boxShadow: "0 4px 24px #0af4, 0 2px 18px #ffe14a20",
              letterSpacing: "0.22em",
              transition: "background 0.22s, color 0.22s",
              cursor: "pointer"
            }}
            title="Toggle 3D Cart & Closet"
          >
            C.A.RT
          </button>
          {/* --- 3D MAGNETIC SCENE --- */}
          <div style={{ height: 440, width: "100%", margin: "0 auto", marginBottom: 20 }}>
            <GravityScene mode={sceneMode} />
          </div>
          <AvatarClothingSelector />
          {/* AUTH PANEL */}
          {!user ? (
            <div style={{
              background: "#181825",
              padding: 20,
              borderRadius: 12,
              marginTop: 20,
              boxShadow: "0 0 20px #0af",
              width: "100%",
              maxWidth: 360
            }}>
              <h2 style={{ color: "#0af", marginBottom: 12 }}>{signupMode ? "🟢 Create Account" : "🔐 Log In"}</h2>
              <form
 
 onSubmit={async (e) => {
    e.preventDefault();
    setSignupError("");

    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setSignupError(error.message);
    } else {
      alert("Account created! Please check your email to confirm.");
      window.location.reload();
    }
  }}
>

                <input name="email" type="email" placeholder="Email" required style={{ width: "100%", padding: 10, marginBottom: 10, background: "#222", color: "#fff", border: "1px solid #444", borderRadius: 6 }} />
                <input name="password" type="password" placeholder="Password" required style={{ width: "100%", padding: 10, marginBottom: 10, background: "#222", color: "#fff", border: "1px solid #444", borderRadius: 6 }} />
                <button type="submit" style={{ background: "#0af", color: "#000", padding: "10px 16px", borderRadius: 6, fontWeight: "bold", width: "100%" }}>
                  {signupMode ? "Create Account" : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => { setSignupMode(!signupMode); setSignupError(""); }}
                  style={{ background: "transparent", color: "#0af", marginTop: 8, width: "100%" }}
                >
                  {signupMode ? "← Back to Login" : "Need an account? Sign Up"}
                </button>
                {signupError && <div style={{ color: "#ff4d4f", marginTop: 10 }}>{signupError}</div>}
              </form>
            </div>
          ) : (
            <div style={{
              background: "#181825",
              padding: 24,
              borderRadius: 12,
              marginTop: 24,
              marginBottom: 24,
              boxShadow: "0 2px 24px #0af3",
              color: "#fff"
            }}>
              <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
                👤 Welcome, {user?.email}
              </h2>
              <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>
                Account ID: <span style={{ fontFamily: "monospace", fontSize: 13 }}>{user?.id.slice(0, 12)}...</span>
              </p>
              <div style={{ margin: "20px 0" }}>
                <Link href="/transactions" style={{ color: "#0af", marginRight: 24 }}>Transactions</Link>
                <Link href="/receipt" style={{ color: "#0af", marginRight: 24 }}>Receipts</Link>
                {user.email === ADMIN_EMAIL && (
                  <>
                    <Link href="/admin/dashboard" className="text-blue-500 hover:underline" style={{ marginRight: 24 }}>
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={refreshMarketData}
                      disabled={refreshing}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 6,
                        background: refreshing ? "#999" : "#10b981",
                        color: "white",
                        fontWeight: "bold",
                        border: "none",
                        cursor: refreshing ? "not-allowed" : "pointer",
                        marginLeft: 12
                      }}
                    >
                      {refreshing ? "Refreshing..." : "Manual Market Refresh"}
                    </button>
                    {message && (
                      <p style={{ marginTop: 10, color: message.startsWith("✅") ? "green" : "red" }}>
                        {message}
                      </p>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                style={{
                  background: "#0af",
                  color: "#000",
                  borderRadius: 6,
                  padding: "10px 16px",
                  fontWeight: "bold",
                  marginTop: 16
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* RIGHT PANEL - Business Suite/Departments */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 90, damping: 20 }}
          style={{
            flex: 1,
            padding: 20,
            display: windowWidth < 800 && activePanel !== "right" ? "none" : "block",
            background: "rgba(23,34,60,0.98)"
          }}
        >
          {/* Carousel */}
          <BusinessCarousel department="business" aiPick={false} />

          {/* Department Cards */}
          <h2 style={{ color: "#fff", fontWeight: 700, marginTop: 24, marginBottom: 12, fontSize: 24 }}>
            Company Suite
          </h2>
          {[
            { label: "Art", path: "/business/art", desc: "Art, AGX, Onboarding, Wallet" },
            { label: "Entertainment", path: "/business/entertainment", desc: "Live Shows, Music, Venues" },
            { label: "Cuisine", path: "/business/cuisine", desc: "Restaurants, Food Delivery, Catering" },
            { label: "Fashion", path: "/business/fashion", desc: "Design, Modeling, Retail" },
            { label: "Health & Fitness", path: "/business/health", desc: "Health, Wellness, Fitness" },
            { label: "Science & Tech", path: "/business/science", desc: "Tech, R&D, Consulting" },
            { label: "Community Clipboard", path: "/business/community", desc: "Volunteer, Events, Forum" },
          ].map((dept, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.025, y: -4, boxShadow: "0 6px 40px #0af5" }}
              onMouseEnter={() => setHoveredDept(dept.label)}
              onMouseLeave={() => setHoveredDept(null)}
              style={{
                marginBottom: 14,
                padding: 16,
                background: "#232a39",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 1px 6px #0af1",
                position: "relative",
                minHeight: 76,
                transition: "background 0.22s, box-shadow 0.22s"
              }}
              onClick={() => router.push(dept.path)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3 style={{ flex: 1, margin: 0, color: "#0af", fontWeight: 700 }}>{dept.label}</h3>
                {dept.label === "Art" && (
                  <div style={{ marginLeft: 12, position: "relative", zIndex: 8 }}>
                    <Info size={22} color="#2ff6a8" style={{ verticalAlign: "middle", cursor: "pointer" }}
                      onClick={e => {
                        e.stopPropagation();
                        router.push("/business/art?about=1");
                      }}
                    />
                  </div>
                )}
              </div>
              <p style={{ margin: "2px 0 0 0", opacity: 0.78, color: "#fff" }}>{dept.desc}</p>
              {/* About message on hover (Art only) */}
              {dept.label === "Art" && hoveredDept === "Art" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: "absolute",
                    right: 28,
                    top: 8,
                    background: "#151a21",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontSize: 14,
                    boxShadow: "0 2px 18px #0af2",
                    maxWidth: 300,
                    zIndex: 20
                  }}
                >
                  the art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
