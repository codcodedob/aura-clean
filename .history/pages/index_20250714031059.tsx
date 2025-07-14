import React, { useState, useEffect } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { List } from "react-virtualized";
import CoinCard from "@/components/CoinCard";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";

export default function Page() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [investmentAmounts, setInvestmentAmounts] = useState<Record<string, number>>({});
  const [windowWidth, setWindowWidth] = useState(1200);
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [sceneMode, setSceneMode] = useState<"cart" | "closet">("cart");

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const featuredCoin = null; // Replace with your logic
  const othersCoins = []; // Replace with your logic
  function handleBuy() {
    // Your buy logic
  }

  return (
    <div
      style={{
        display: windowWidth < 800 ? "block" : "flex",
        height: "100vh",
        flexDirection: windowWidth < 800 ? "column" : "row",
        background: "linear-gradient(120deg, #181825 40%, #111827 100%)",
        color: "var(--text-color)"
      }}
    >
      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            background: "#181825",
            padding: "12px 0",
            borderBottom: "1.5px solid #222"
          }}
        >
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
              userSelect: "none"
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
              userSelect: "none"
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
              userSelect: "none"
            }}
          >
            Suite
          </button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div
          style={{
            flex: 1,
            padding: 24,
            overflow: "hidden",
            display: windowWidth < 800 && activePanel !== "left" ? "none" : "block",
            background: "rgba(24,24,37,0.98)",
            borderRight: "1.5px solid #222c"
          }}
        >
          {/* ✅ This is the ONLY CHANGE */}
          <div style={{ height: windowWidth < 800 ? "auto" : "100%" }}>
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
               
