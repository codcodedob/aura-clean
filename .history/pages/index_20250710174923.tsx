import React, { useState, useEffect } from "react";
import CoinCard from "@/components/CoinCard";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import GravityScene from "@/components/GravityScene";

export default function Home() {
  // User auth state
  const [user, setUser] = useState<any>(null);

  // Coins from Supabase
  const [coins, setCoins] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  // Panel visibility state for responsive toggle
  const [visiblePanel, setVisiblePanel] = useState<"left" | "center" | "right">("left");

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Load coins visible and active for user (or public)
  useEffect(() => {
    async function fetchCoins() {
      const { data, error } = await supabase
        .from("aura_coins")
        .select("*")
        .eq("visible", true)
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading coins:", error);
      } else {
        setCoins(data ?? []);
        // Initialize amounts state to price for each coin
        const initialAmounts: Record<string, number> = {};
        (data ?? []).forEach((c) => {
          initialAmounts[c.id] = c.price;
        });
        setAmounts(initialAmounts);
      }
    }

    fetchCoins();
  }, []);

  function handleAmountChange(coinId: string, amount: number) {
    setAmounts((prev) => ({ ...prev, [coinId]: amount }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Responsive toggle buttons to show only one panel on small screen
  const isMobile = typeof window !== "undefined" && window.innerWidth < 800;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        background: "#111",
        color: "#eee",
        overflow: "hidden",
      }}
    >
      {/* Left panel: Coins */}
      {(!isMobile || visiblePanel === "left") && (
        <aside
          style={{
            width: 320,
            overflowY: "auto",
            borderRight: "1px solid #222",
            padding: 16,
            background: "#141414",
          }}
        >
          <h2 style={{ marginBottom: 16 }}>Coins</h2>
          {coins.length === 0 && <p>No coins available</p>}
          {coins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              amount={amounts[coin.id] ?? coin.price}
              onAmountChange={handleAmountChange}
              userId={user?.id ?? ""}
            />
          ))}
        </aside>
      )}

      {/* Center panel: 3D Scenes */}
      {(!isMobile || visiblePanel === "center") && (
        <main
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 20,
            overflowY: "auto",
            background: "#151a21",
          }}
        >
          <h1 style={{ marginBottom: 20 }}>3D Scenes</h1>
          <div style={{ width: "100%", maxWidth: 900, marginBottom: 24 }}>
            <AvatarClothingSelector />
          </div>
          <div style={{ width: "100%", maxWidth: 900, marginBottom: 24 }}>
            <GravityScene mode="closet" />
          </div>
          <div style={{ width: "100%", maxWidth: 900 }}>
            <GravityScene mode="cart" />
          </div>
        </main>
      )}

      {/* Right panel: Login/Logout & Controls */}
      {(!isMobile || visiblePanel === "right") && (
        <aside
          style={{
            width: 320,
            borderLeft: "1px solid #222",
            padding: 16,
            background: "#141414",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2>Account</h2>
            {!user && (
              <button
                onClick={() =>
                  supabase.auth.signInWithOAuth({ provider: "google" })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  backgroundColor: "#0af",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Login with Google
              </button>
            )}
            {user && (
              <div>
                <p>Welcome, {user.email}</p>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    backgroundColor: "#f44",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    marginTop: 12,
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Panel toggles for mobile */}
          {isMobile && (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <button
                onClick={() => setVisiblePanel("left")}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  background: visiblePanel === "left" ? "#0af" : "#333",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  flexGrow: 1,
                  marginRight: 6,
                }}
              >
                Coins
              </button>
              <button
                onClick={() => setVisiblePanel("center")}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  background: visiblePanel === "center" ? "#0af" : "#333",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  flexGrow: 1,
                  marginRight: 6,
                }}
              >
                3D Scenes
              </button>
              <button
                onClick={() => setVisiblePanel("right")}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  background: visiblePanel === "right" ? "#0af" : "#333",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  flexGrow: 1,
                }}
              >
                Account
              </button>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
