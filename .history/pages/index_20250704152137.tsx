// pages/index.tsx
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

const ADMIN_EMAIL = "burks.donte@gmail.com";

interface Coin { /* ...same as before... */ }

const FocusedAvatar = lazy(() => import("@/components/FocusedAvatar")) as React.LazyExoticComponent<React.ComponentType<{}>>;
const FullBodyAvatar = lazy(() => import("@/components/FullBodyAvatar")) as React.LazyExoticComponent<React.ComponentType<{ modelPaths: string[] }>>;

// CoinCard unchanged except style changes:
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
      margin: "1rem 0", padding: "1rem",
      borderRadius: 20, background: "#fff",
      boxShadow: "0 4px 18px #b0cbff33",
      border: "1.5px solid #e8eef7",
      textAlign: "center"
    }}>
      <strong style={{ fontSize: 20 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
      <p style={{ fontSize: 15, color: "#556" }}>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{
          marginTop: 8, padding: 10, width: "85%",
          borderRadius: 9, border: "1.5px solid #c4d7ee",
          background: "#f6f8fc", color: "#252b3a",
          fontSize: 16
        }}
      />
      <button
        onClick={() => onBuy(coin.id)}
        style={{
          marginTop: 14, padding: "12px 22px", borderRadius: 10,
          background: "linear-gradient(90deg,#60a5fa 0%,#2563eb 100%)",
          color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
          fontSize: 15, boxShadow: "0 2px 14px #3b82f688"
        }}
      >Buy</button>
    </div>
  );
}

export default function Home() {
  // ...all state and logic remains unchanged...

  // ...effects and methods remain unchanged...

  if (!hasMounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      padding: 0,
      display: "flex",
      flexDirection: windowWidth < 800 ? "column" : "row"
    }}>
      {/* MOBILE TAB BAR (unchanged) */}
      {windowWidth < 800 && (
        <div style={{
          display: "flex", justifyContent: "space-around",
          background: "#fff", padding: 12,
          borderRadius: 16, boxShadow: "0 2px 20px #e0edfa33", margin: 12
        }}>
          <button onClick={() => setActivePanel("left")} style={{
            color: activePanel === "left" ? "#2563eb" : "#888", fontWeight: 700, flex: 1,
            background: "none", border: "none", fontSize: 18, padding: 10, borderRadius: 8
          }}>Coins</button>
          <button onClick={() => setActivePanel("center")} style={{
            color: activePanel === "center" ? "#2563eb" : "#888", fontWeight: 700, flex: 1,
            background: "none", border: "none", fontSize: 18, padding: 10, borderRadius: 8
          }}>Profile</button>
          <button onClick={() => setActivePanel("right")} style={{
            color: activePanel === "right" ? "#2563eb" : "#888", fontWeight: 700, flex: 1,
            background: "none", border: "none", fontSize: 18, padding: 10, borderRadius: 8
          }}>Suite</button>
        </div>
      )}

      {/* LEFT PANEL - Coins */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div style={{
          flex: 1,
          minWidth: 340,
          maxWidth: 420,
          margin: 24,
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 4px 32px #e0edfa22",
          display: windowWidth < 800 && activePanel !== "left" ? "none" : "block"
        }}>
          <div style={{ padding: 28 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins"
              style={{
                padding: 13, borderRadius: 12, width: "100%", marginBottom: 14,
                border: "1.5px solid #d1e4f6", fontSize: 16, background: "#f2f6fb"
              }}
            />
            <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
              <button onClick={() => setFilter("all")} style={{
                flex: 1, borderRadius: 9, padding: 10, fontWeight: 700,
                background: filter === "all" ? "#dbeafe" : "#f4f7fb", color: "#222", border: "none"
              }}>All</button>
              <button onClick={() => setFilter("stock")} style={{
                flex: 1, borderRadius: 9, padding: 10, fontWeight: 700,
                background: filter === "stock" ? "#dbeafe" : "#f4f7fb", color: "#222", border: "none"
              }}>Stocks</button>
              <button onClick={() => setFilter("crypto")} style={{
                flex: 1, borderRadius: 9, padding: 10, fontWeight: 700,
                background: filter === "crypto" ? "#dbeafe" : "#f4f7fb", color: "#222", border: "none"
              }}>Crypto</button>
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

      {/* CENTER PANEL - Profile, Avatar, Auth */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div style={{
          flex: 1.1,
          margin: 24,
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 4px 32px #e0edfa33",
          display: windowWidth < 800 && activePanel !== "center" ? "none" : "block"
        }}>
          <div style={{ padding: 32 }}>
            <Suspense fallback={<div>Loading Avatar...</div>}>
              {mode === "focused" ? (
                <FocusedAvatar key={avatarKey} />
              ) : (
                <FullBodyAvatar key={avatarKey} modelPaths={gridMode ? fullBodyModels : ["/models/full-body.glb"]} />
              )}
            </Suspense>
            <button onClick={toggleMode} style={{
              marginTop: 18, marginBottom: 8, borderRadius: 9,
              background: "#2563eb", color: "#fff", padding: "10px 20px",
              border: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 14px #3b82f688"
            }}>Toggle Fit</button>
            {mode === "full-body" && (
              <button onClick={() => setGridMode(!gridMode)} style={{
                marginLeft: 10, borderRadius: 9,
                background: "#fbbf24", color: "#222", padding: "10px 20px",
                border: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 14px #fde68a88"
              }}>Layout/Grid View</button>
            )}
            <AvatarClothingSelector />
            {/* AUTH PANEL - unchanged, just increased border-radius/shadow */}
            {!user ? (
              <div style={{
                background: "#f3f6fc", padding: 32, borderRadius: 20, marginTop: 28,
                boxShadow: "0 2px 18px #aac9ff3c", width: "100%", maxWidth: 400
              }}>
                {/* ...login form unchanged... */}
                {/* ...copy/paste your form code here... */}
              </div>
            ) : (
              <div style={{
                background: "#f3f6fc", padding: 32, borderRadius: 20,
                marginTop: 28, marginBottom: 24,
                boxShadow: "0 2px 18px #aac9ff3c", color: "#222"
              }}>
                {/* ...user account info panel unchanged... */}
                {/* ...copy/paste your user info code here... */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT PANEL - Company Suite/Departments */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 90, damping: 20 }}
          style={{
            flex: 1,
            margin: 24,
            borderRadius: 28,
            background: "#fff",
            boxShadow: "0 4px 32px #e0edfa33",
            display: windowWidth < 800 && activePanel !== "right" ? "none" : "block"
          }}
        >
          <div style={{ padding: 32 }}>
            {/* Carousel */}
            <BusinessCarousel department="business" aiPick={false} />
            {/* Onboarding Style Section Header */}
            <div style={{ margin: "38px 0 28px" }}>
              <span style={{
                fontWeight: 800,
                color: "#181F2F",
                background: "#eaf2fc",
                padding: "9px 28px",
                borderRadius: 16,
                fontSize: 23,
                letterSpacing: "0.02em",
                boxShadow: "0 1px 8px #bae6fd22"
              }}>Company Suite</span>
            </div>
            {/* Department Cards */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 26
            }}>
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
                  whileHover={{ scale: 1.035, y: -6, boxShadow: "0 8px 34px #bae6fd66" }}
                  onMouseEnter={() => setHoveredDept(dept.label)}
                  onMouseLeave={() => setHoveredDept(null)}
                  style={{
                    padding: 24,
                    background: "#f6fafd",
                    borderRadius: 20,
                    cursor: "pointer",
                    boxShadow: "0 1px 8px #bae6fd33",
                    position: "relative",
                    minHeight: 94,
                    border: "1.5px solid #e3eefa",
                    transition: "background 0.22s, box-shadow 0.22s"
                  }}
                  onClick={() => router.push(dept.path)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h3 style={{ flex: 1, margin: 0, fontWeight: 700, fontSize: 21, color: "#1e293b" }}>{dept.label}</h3>
                    {dept.label === "Art" && (
                      <div style={{ marginLeft: 14, position: "relative", zIndex: 8 }}>
                        <Info size={24} color="#14e4ab" style={{ verticalAlign: "middle", cursor: "pointer" }}
                          onClick={e => {
                            e.stopPropagation();
                            router.push("/business/art?about=1");
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <p style={{ margin: "6px 0 0 0", color: "#3b4959", fontSize: 16, opacity: 0.78 }}>{dept.desc}</p>
                  {/* About message on hover (Art only) */}
                  {dept.label === "Art" && hoveredDept === "Art" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{
                        position: "absolute",
                        right: 40,
                        top: 12,
                        background: "#d1f7e7",
                        color: "#191d1f",
                        padding: "10px 20px",
                        borderRadius: 13,
                        fontSize: 15,
                        boxShadow: "0 2px 14px #14e4ab33",
                        maxWidth: 340,
                        zIndex: 20
                      }}
                    >
                      the art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Help/Support Tiles at the bottom */}
            <div style={{
              marginTop: 38, display: "flex", gap: 18, flexWrap: "wrap"
            }}>
              <div style={{
                background: "#fff", borderRadius: 17,
                boxShadow: "0 2px 12px #c2e4f722",
                padding: "24px 34px", fontWeight: 700, color: "#1d273e",
                fontSize: 17, display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{
                  background: "#fde68a", color: "#bb6b04",
                  padding: "6px 12px", borderRadius: 9, fontWeight: 800, fontSize: 16
                }}>?</span>
                FAQs
              </div>
              <div style={{
                background: "#fff", borderRadius: 17,
                boxShadow: "0 2px 12px #c2e4f722",
                padding: "24px 34px", fontWeight: 700, color: "#1d273e",
                fontSize: 17, display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{
                  background: "#60a5fa", color: "#1e293b",
                  padding: "6px 12px", borderRadius: 9, fontWeight: 800, fontSize: 16
                }}>▶</span>
                Tutorial Videos
              </div>
              <div style={{
                background: "#fff", borderRadius: 17,
                boxShadow: "0 2px 12px #c2e4f722",
                padding: "24px 34px", fontWeight: 700, color: "#1d273e",
                fontSize: 17, display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{
                  background: "#fca5a5", color: "#7f1d1d",
                  padding: "6px 12px", borderRadius: 9, fontWeight: 800, fontSize: 16
                }}>💬</span>
                Live Support
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
