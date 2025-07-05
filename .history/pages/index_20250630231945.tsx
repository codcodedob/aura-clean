import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Animated BG for base.org vibe
function AnimatedBG() {
  // Friendly 3D SVGs and some moving "particles"
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Large friendly objects */}
      <svg width="100vw" height="100vh" style={{ position: "absolute", top: "-10%", left: "-10%", zIndex: 0 }}>
        {/* Replace these with any 3D SVG or real canvas WebGL/Three.js */}
        <circle cx="300" cy="120" r="120" fill="#0af8" />
        <rect x="900" y="400" width="240" height="110" rx="60" fill="#fecf2f40" />
        <ellipse cx="1300" cy="130" rx="100" ry="36" fill="#34d39966" />
        <polygon points="200,600 270,680 140,680" fill="#fb7185bb" />
        {/* Spray style lines */}
        <polyline points="300,800 450,880 520,810" stroke="#0af" strokeWidth="11" fill="none" opacity="0.23"/>
      </svg>
      {/* Particle dots (you can add a loop for more) */}
      <div style={{ position: "absolute", left: "30vw", top: "12vh", width: 18, height: 18, background: "#fecf2f", borderRadius: 12, filter: "blur(1.5px)", opacity: 0.32, animation: "move1 7s infinite alternate" }} />
      <div style={{ position: "absolute", left: "76vw", top: "54vh", width: 23, height: 23, background: "#0af", borderRadius: 20, filter: "blur(3px)", opacity: 0.25, animation: "move2 11s infinite alternate" }} />
      <div style={{ position: "absolute", left: "19vw", top: "81vh", width: 15, height: 15, background: "#f472b6", borderRadius: 20, filter: "blur(2.5px)", opacity: 0.24, animation: "move3 13s infinite alternate" }} />
      <style>{`
        @keyframes move1 { to { left: 42vw; top: 21vh; } }
        @keyframes move2 { to { left: 68vw; top: 59vh; } }
        @keyframes move3 { to { left: 24vw; top: 75vh; } }
      `}</style>
    </div>
  );
}

// Magnetic card for department
function MagneticDeptCard({ dept, onClick, onInfo }: { dept: any; onClick: () => void; onInfo?: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 20 });
  const springY = useSpring(y, { stiffness: 220, damping: 20 });
  const springRX = useSpring(rotateX, { stiffness: 180, damping: 24 });
  const springRY = useSpring(rotateY, { stiffness: 180, damping: 24 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cardX = rect.left + rect.width / 2;
    const cardY = rect.top + rect.height / 2;
    const dx = e.clientX - cardX;
    const dy = e.clientY - cardY;
    const strength = Math.max(120, rect.width);
    x.set((dx / strength) * 24);
    y.set((dy / strength) * 18);
    rotateY.set((dx / strength) * 10);
    rotateX.set((-dy / strength) * 10);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }

  // Custom About tooltip for Art department (on hover over card, not info icon)
  const [showAbout, setShowAbout] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      style={{
        marginBottom: 24,
        padding: 32,
        borderRadius: 22,
        background: "linear-gradient(120deg,#181a23 60%,#222325 100%)",
        boxShadow: "0 4px 32px #0af3, 0 0 0 2.2px #0af8, 0 0 24px #0af1 inset",
        border: "2.5px solid #0af",
        color: "#f3f3f3",
        fontWeight: 700,
        minHeight: 138,
        minWidth: 246,
        maxWidth: 340,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        willChange: "transform",
        userSelect: "none",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
      initial={{ scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.07 }}
      style={{
        x: springX,
        y: springY,
        rotateX: springRX,
        rotateY: springRY,
      }}
      onMouseMove={e => {
        handleMouseMove(e);
        // Only for Art department, show About tooltip on card hover
        if (dept.label === "Art") setShowAbout(true);
      }}
      onMouseLeave={e => {
        handleMouseLeave();
        if (dept.label === "Art") setShowAbout(false);
      }}
      onClick={onClick}
    >
      <div style={{
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: 0.2,
        marginBottom: 5,
        color: '#0af',
        textShadow: '0 2px 12px #2229'
      }}>
        {dept.label}
      </div>
      <div style={{
        fontSize: 16,
        color: "#fff",
        fontWeight: 400,
        opacity: 0.93,
        marginBottom: 6,
        letterSpacing: 0.04,
      }}>
        {dept.desc}
      </div>
      {/* Info icon — click for extra action (like contracts) */}
      {dept.info && (
        <motion.button
          whileHover={{ scale: 1.2, rotate: 12 }}
          style={{
            background: "#111a",
            border: "1.5px solid #0af7",
            borderRadius: "50%",
            width: 28,
            height: 28,
            color: "#0af",
            fontWeight: 900,
            fontSize: 19,
            cursor: "pointer",
            position: "absolute",
            top: 18,
            right: 22,
            zIndex: 20,
          }}
          title={dept.info}
          onClick={e => {
            e.stopPropagation();
            dept.onInfo && dept.onInfo();
          }}
        >
          ?
        </motion.button>
      )}
      {/* Art About: big, pretty tooltip */}
      {dept.label === "Art" && showAbout && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          style={{
            position: "absolute",
            left: 18,
            top: 70,
            zIndex: 30,
            background: "#fff",
            color: "#181c2c",
            borderRadius: 13,
            padding: "18px 24px",
            fontWeight: 600,
            fontSize: 17,
            boxShadow: "0 2px 24px #0af2",
            border: "2px solid #0af6",
            maxWidth: 270,
            pointerEvents: "none",
            opacity: 0.98,
          }}
        >
          The art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.
        </motion.div>
      )}
    </motion.div>
  );
}

// Main departments
const departments = [
  {
    label: "Art",
    path: "/business/art",
    desc: "Art, AGX, Onboarding, Wallet",
    info: "Learn more about contracts and onboarding",
    onInfo: (router?: any) => router && router.push("/contracts"),
  },
  {
    label: "Entertainment",
    path: "/business/entertainment",
    desc: "Live Shows, Music, Venues",
    info: "See events, artists, music",
  },
  {
    label: "Cuisine",
    path: "/business/cuisine",
    desc: "Restaurants, Food Delivery, Catering",
    info: "See food, chefs, recipes",
  },
  {
    label: "Fashion",
    path: "/business/fashion",
    desc: "Design, Modeling, Retail",
    info: "See styles, designers, shops",
  },
  {
    label: "Health & Fitness",
    path: "/business/health",
    desc: "Health, Wellness, Fitness",
    info: "Track wellness, fitness, appointments",
  },
  {
    label: "Science & Tech",
    path: "/business/science",
    desc: "Tech, R&D, Consulting",
    info: "Explore research, tech, innovation",
  },
  {
    label: "Community Clipboard",
    path: "/business/community",
    desc: "Volunteer, Events, Forum",
    info: "Find events, volunteer, connect",
  }
];

// Your previous CoinCard, FocusedAvatar, FullBodyAvatar, user logic, left/center panels remain unchanged
// ... (Your code from previous index.tsx for those panels goes here)

export default function Home() {
  // ... (All your existing state and logic from your last index.tsx)
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
  const router = useRouter();

  // ... (useEffect, data fetching, user/auth, etc.)

  // Only right panel is "magnetic"
  const rightPanel = (
    <div style={{
      flex: 1,
      padding: 20,
      display: windowWidth < 800 && activePanel !== "right" ? "none" : "block",
      zIndex: 2,
      position: "relative",
    }}>
      <h2 style={{ fontWeight: 800, fontSize: 30, marginBottom: 10, letterSpacing: 0.09, color: "#fff" }}>
        Company Suite
      </h2>
      {departments.map((dept, i) => (
        <MagneticDeptCard
          key={dept.label}
          dept={{
            ...dept,
            onInfo: dept.label === "Art"
              ? () => router.push("/contracts")
              : undefined
          }}
          onClick={() => router.push(dept.path)}
        />
      ))}
    </div>
  );

  // ... Your leftPanel and centerPanel remain unchanged (see previous index.tsx above)

  // ... (Create leftPanel and centerPanel from your prior implementation.)

  if (!hasMounted) return null;

  return (
    <div style={{
      display: windowWidth < 800 ? "block" : "flex",
      height: "100vh",
      flexDirection: windowWidth < 800 ? "column" : "row",
      position: "relative",
      background: "linear-gradient(130deg, #0af2 0%, #191c24 55%, #222f 100%)"
    }}>
      {/* Animated 3D Background */}
      <AnimatedBG />

      {/* Your Mobile Tab Bar ... */}
      {/* Left Panel */}
      {/* Center Panel */}
      {/* Right Panel */}
      {/* Insert your previous left/center logic here; right panel is the magnetic version above */}

      {/* Right Panel */}
      {(windowWidth >= 800 || activePanel === "right") && rightPanel}

      {/* Fixed My Space Button */}
      <Link href="/space">
        <motion.button
          whileHover={{ scale: 1.09, backgroundColor: "#0af" }}
          style={{
            position: "fixed",
            bottom: 22,
            right: 38,
            background: "#111d",
            color: "#0af",
            fontWeight: 700,
            fontSize: 19,
            borderRadius: 15,
            border: "2.5px solid #0af",
            padding: "18px 38px",
            zIndex: 99,
            boxShadow: "0 3px 28px #0af6"
          }}>
          My Space
        </motion.button>
      </Link>
    </div>
  );
}
