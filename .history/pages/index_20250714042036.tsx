import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import CoinCard from "@/components/CoinCard";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";

const ADMIN_EMAIL = "youradmin@example.com"; // Replace with your admin email

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [coins, setCoins] = useState([]);
  const [featuredCoin, setFeaturedCoin] = useState(null);
  const [othersCoins, setOthersCoins] = useState([]);
  const [investmentAmounts, setInvestmentAmounts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [departmentMedia, setDepartmentMedia] = useState([]);

  // Auth subscription
  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Window resize listener
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch coins & featured coin on load & filters/search change
  useEffect(() => {
    async function fetchCoins() {
      // Example fetch logic - replace with your actual Supabase queries or API calls
      let query = supabase.from("coins").select("*");

      if (filter !== "all") {
        query = query.eq("type", filter);
      }

      const { data, error } = await query;

      if (error) {
        setMessage("Failed to load coins.");
        return;
      }

      // Filter by search term
      let filteredCoins = data;
      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        filteredCoins = data.filter((c) =>
          c.name.toLowerCase().includes(lowerSearch) ||
          c.symbol.toLowerCase().includes(lowerSearch)
        );
      }

      // Assume the featured coin is the coin owned by the user (if any)
      const userCoin = filteredCoins.find((c) => c.user_id === user?.id);
      setFeaturedCoin(userCoin ?? null);
      setOthersCoins(filteredCoins.filter((c) => c !== userCoin));
      setCoins(filteredCoins);
    }

    fetchCoins();
  }, [user, filter, search]);

  // Fetch department media
  useEffect(() => {
    async function fetchMedia() {
      const { data, error } = await supabase
        .from("department_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDepartmentMedia(data);
      }
    }

    fetchMedia();
  }, []);

  // Handle purchase / buy button
  const handleBuy = async (coinId, amount) => {
    // Your purchase logic here
    setMessage(`Attempting to buy ${amount} of coin ${coinId}`);
    // Simulate purchase success
    setTimeout(() => setMessage(`Successfully bought ${amount} of coin ${coinId}`), 2000);
  };

  // Refresh market data (admin only)
  const refreshMarketData = async () => {
    setRefreshing(true);
    setMessage("Refreshing market data...");
    // Simulate async refresh call
    setTimeout(() => {
      setMessage("Market data refreshed!");
      setRefreshing(false);
    }, 3000);
  };

  // Tab buttons for small screens
  const renderTabBar = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        background: "rgba(24,24,37,0.98)",
        borderBottom: "1.5px solid #222c",
        padding: "8px 0",
        userSelect: "none",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {["left", "center", "right"].map((panel) => (
        <button
          key={panel}
          onClick={() => setActivePanel(panel)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 12,
            margin: "0 4px",
            fontWeight: activePanel === panel ? "700" : "400",
            fontSize: 14,
            background: activePanel === panel ? "#0af" : "transparent",
            color: activePanel === panel ? "#fff" : "var(--text-color)",
            border: "1.5px solid #0af",
            cursor: "pointer",
          }}
        >
          {panel === "left"
            ? "All Coins"
            : panel === "center"
            ? "Your Coin"
            : "Company Suite"}
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--background-color)",
        color: "var(--text-color)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        flexDirection: windowWidth < 800 ? "column" : "row",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          padding: "12px 24px",
          background: "rgba(20,20,32,0.98)",
          color: "#0af",
          fontWeight: "700",
          fontSize: 24,
          userSelect: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 2000,
        }}
      >
        AURA Coin Dashboard
      </header>

      {/* Tab bar for mobile */}
      {windowWidth < 800 && renderTabBar()}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div
          style={{
            flex: 1,
            padding: 24,
            overflowY: "auto",
            display:
              windowWidth < 800 && activePanel !== "left" ? "none" : "block",
            background: "rgba(24,24,37,0.98)",
            borderRight: "1.5px solid #222c",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 16 }}>
            All Coins
          </h2>
          <input
            type="search"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 12,
              borderRadius: 10,
              border: "1.5px solid #444",
              background: "var(--input-bg)",
              color: "var(--text-color)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                marginRight: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: filter === "all" ? "#0af" : "transparent",
                color: filter === "all" ? "#fff" : "var(--text-color)",
                border: "1.5px solid #0af",
                cursor: "pointer",
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter("stock")}
              style={{
                marginRight: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: filter === "stock" ? "#0af" : "transparent",
                color: filter === "stock" ? "#fff" : "var(--text-color)",
                border: "1.5px solid #0af",
                cursor: "pointer",
              }}
            >
              Stocks
            </button>
            <button
              onClick={() => setFilter("crypto")}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: filter === "crypto" ? "#0af" : "transparent",
                color: filter === "crypto" ? "#fff" : "var(--text-color)",
                border: "1.5px solid #0af",
                cursor: "pointer",
              }}
            >
              Crypto
            </button>
          </div>

          {refreshing && <p>Refreshing market data...</p>}
          {message && <p>{message}</p>}
          {user?.email === ADMIN_EMAIL && (
            <button
              onClick={refreshMarketData}
              disabled={refreshing}
              style={{
                marginTop: 12,
                padding: "10px 16px",
                borderRadius: 12,
                background: "#0a0",
                color: "#fff",
                cursor: refreshing ? "not-allowed" : "pointer",
                border: "none",
                fontWeight: "700",
              }}
            >
              Refresh Market Data
            </button>
          )}

          <div>
            {othersCoins.length === 0 && <p>No coins found.</p>}
            {othersCoins.map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                amount={investmentAmounts[coin.id] ?? coin.price}
                onAmountChange={(id, amt) =>
                  setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))
                }
                onBuy={handleBuy}
                showImage={true} // Ensure images show on coin cards
              />
            ))}
          </div>
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div
          style={{
            flexBasis: 380,
            padding: 24,
            background: "rgba(28,28,41,0.95)",
            borderRight: "1.5px solid #222c",
            display:
              windowWidth < 800 && activePanel !== "center" ? "none" : "block",
            userSelect: "none",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 16 }}>
            Your Coin
          </h2>
          {!user && (
            <p style={{ fontStyle: "italic", marginBottom: 12 }}>
              Please sign in to view and manage your coin.
            </p>
          )}

          {user && featuredCoin && featuredCoin.user_id === user.id ? (
            <CoinCard
              coin={featuredCoin}
              amount={investmentAmounts[featuredCoin.id] ?? featuredCoin.price}
              onAmountChange={(id, amt) =>
                setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))
              }
              onBuy={handleBuy}
              showImage={true}
            />
          ) : (
            <p>You don’t have a featured coin yet.</p>
          )}

          <div style={{ marginTop: 24 }}>
            <AvatarClothingSelector userId={user?.id} />
          </div>

          <button
            onClick={() => router.push("/transaction-history")}
            style={{
              marginTop: 28,
              padding: "10px 18px",
              borderRadius: 14,
              background: "#0af",
              color: "#fff",
              fontWeight: "700",
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            View Transaction History
          </button>
        </div>
      )}

      {/* RIGHT PANEL */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <div
          style={{
            flexBasis: 300,
            padding: 24,
            background: "rgba(28,28,41,0.95)",
            display:
              windowWidth < 800 && activePanel !== "right" ? "none" : "block",
            userSelect: "none",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 16 }}>
            Company Suite
          </h2>

          {departmentMedia.length === 0 ? (
            <p>No media available.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
                maxHeight: "65vh",
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {departmentMedia.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: 12,
                    background: "#111",
                    padding: 12,
                    boxShadow: "0 0 10px #0af55",
                    cursor: item.link_url ? "pointer" : "default",
                  }}
                  onClick={() =>
                    item.link_url && window.open(item.link_url, "_blank")
                  }
                  role={item.link_url ? "link" : undefined}
                  tabIndex={item.link_url ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && item.link_url)
                      window.open(item.link_url, "_blank");
                  }}
                >
                  {item.img_url && (
                    <img
                      src={item.img_url}
                      alt={item.title}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        marginBottom: 8,
                        objectFit: "cover",
                        aspectRatio: "16/9",
                      }}
                      loading="lazy"
                    />
                  )}
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0af",
                    }}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p
                      style={{
                        fontSize: 14,
                        opacity: 0.75,
                        marginBottom: 6,
                        userSelect: "text",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                  {item.video_url && (
                    <video
                      controls
                      src={item.video_url}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3D Scene Placeholder - Deactivated for now */}
      {/* <ThreeDScene /> */}
    </div>
  );
}
