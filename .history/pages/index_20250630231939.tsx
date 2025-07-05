import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { motion, useMotionValue, useSpring } from "framer-motion";

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

// --- Animated 3D BG --- //
function AnimatedBG() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <svg width="100vw" height="100vh" style={{ position: "absolute", top: "-10%", left: "-10%", zIndex: 0 }}>
        <circle cx="300" cy="120" r="120" fill="#0af8" />
        <rect x="900" y="400" width="240" height="110" rx="60" fill="#fecf2f40" />
        <ellipse cx="1300" cy="130" rx="100" ry="36" fill="#34d39966" />
        <polygon points="200,600 270,680 140,680" fill="#fb7185bb" />
        <polyline points="300,800 450,880 520,810" stroke="#0af" strokeWidth="11" fill="none" opacity="0.23"/>
      </svg>
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

// --- Magnetic Card --- //
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
    x.set(0); y.set(0); rotateX.set(0); rotateY.set(0);
  }
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

// --- Main --- //
const departments = [
  {
    label: "Art",
    path: "/business/art",
    desc: "Art, AGX, Onboarding, Wallet",
    info: "Learn more about contracts and onboarding",
    onInfo: (router?: any) => router && router.push("/contracts"),
  },
  { label: "Entertainment", path: "/business/entertainment", desc: "Live Shows, Music, Venues", info: "See events, artists, music" },
  { label: "Cuisine", path: "/business/cuisine", desc: "Restaurants, Food Delivery, Catering", info: "See food, chefs, recipes" },
  { label: "Fashion", path: "/business/fashion", desc: "Design, Modeling, Retail", info: "See styles, designers, shops" },
  { label: "Health & Fitness", path: "/business/health", desc: "Health, Wellness, Fitness", info: "Track wellness, fitness, appointments" },
  { label: "Science & Tech", path: "/business/science", desc: "Tech, R&D, Consulting", info: "Explore research, tech, innovation" },
  { label: "Community Clipboard", path: "/business/community", desc: "Volunteer, Events, Forum", info: "Find events, volunteer, connect" }
];

// --- CoinCard --- //
function CoinCard({ coin, amount, onAmountChange, onBuy }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2))
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  useEffect(() => { setLocalAmount(amount.toFixed(2)) }, [amount])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalAmount(val)
    if (debounceTimer) clearTimeout(debounceTimer)
    const newTimer = setTimeout(() => {
      const num = parseFloat(val)
      if (!isNaN(num)) onAmountChange(coin.id, num)
    }, 500)
    setDebounceTimer(newTimer)
  }
  return (
    <div style={{ margin: '1rem 0', padding: '1rem', borderRadius: 8, border: '1px solid #ccc', background: 'var(--card-bg)', color: 'var(--text-color)', textAlign: 'center' }}>
      <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{ marginTop: 8, padding: 8, width: '80%', borderRadius: 6, border: '1px solid #ccc', background: 'var(--input-bg)', color: 'var(--text-color)' }}
      />
      <button onClick={() => onBuy(coin.id)} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Buy</button>
    </div>
  )
}

// --- Home --- //
export default function Home() {
  const [hasMounted, setHasMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all")
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({})
  const [mode, setMode] = useState<"focused" | "full-body">("focused")
  const [gridMode, setGridMode] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState("")
  const [signupMode, setSignupMode] = useState(false)
  const [signupError, setSignupError] = useState("")
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center")
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)
  const router = useRouter()

  useEffect(() => {
    setHasMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--card-bg', darkMode ? '#1f2937' : '#fff')
    document.documentElement.style.setProperty('--text-color', darkMode ? '#f9fafb' : '#1a1a1a')
    document.documentElement.style.setProperty('--input-bg', darkMode ? '#374151' : '#f3f4f6')
    document.body.style.backgroundColor = darkMode ? '#111827' : '#f9fafb'
  }, [darkMode])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  useEffect(() => {
    fetch('/api/coins')
      .then(res => res.json())
      .then(data => setCoins(data || []))
  }, [])

  // PATCH: Support $0 checkout
  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0
    const coin = coins.find(c => c.id === coinId)
    if (!coin) return
    const userData = await supabase.auth.getUser()
    const userId = userData.data.user?.id
    if (!userId) {
      alert('Sign in required')
      return
    }
    if (amount === 0) {
      await supabase.from('coin_activity').insert({
        user_id: userId,
        coin_id: coinId,
        type: 'purchase',
        amount,
        description: `Free/discounted purchase for $${amount}`
      })
      router.push('/receipt')
      return
    }
    await supabase.from('coin_activity').insert({
      user_id: userId,
      coin_id: coinId,
      type: 'purchase',
      amount,
      description: `Intent to purchase $${amount}`
    })
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId, amount, userId })
    })
    const json = await res.json()
    const stripe = (await import('@stripe/stripe-js')).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    ;(await stripe)?.redirectToCheckout({ sessionId: json.sessionId })
  }

  // Filtering coins
  const filteredCoins = coins.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? '').includes(search)
    const matchesType = filter === 'all' || c.type === filter
    return matchesSearch && matchesType
  })
  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id)
  const featuredCoin = filteredCoins.find(c => c.is_featured)

  const toggleMode = () => {
    setMode(prev => prev === 'focused' ? 'full-body' : 'focused')
    setAvatarKey(prev => prev + 1)
  }

  if (!hasMounted) return null

  // --- PANELS ---
  const leftPanel = (
    <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: windowWidth < 800 && activePanel !== 'left' ? 'none' : 'block', zIndex: 2 }}>
      <div style={{ height: '100%' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ padding: 10, borderRadius: 6, width: '100%', marginBottom: 10 }}
        />
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setFilter('all')}>All</button>
          <button onClick={() => setFilter('stock')}>Stocks</button>
          <button onClick={() => setFilter('crypto')}>Crypto</button>
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
                const coin = index === 0 && featuredCoin
                  ? featuredCoin
                  : othersCoins[index - (featuredCoin ? 1 : 0)]
                return (
                  <div style={style} key={coin.id}>
                    <CoinCard
                      coin={coin}
                      amount={investmentAmounts[coin.id] || coin.price}
                      onAmountChange={(id, amt) => setInvestmentAmounts(prev => ({ ...prev, [id]: amt }))}
                      onBuy={handleBuy}
                    />
                  </div>
                )
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  )

  const fullBodyModels = [
    '/models/F1VISIONBALNCICHROME.glb',
    '/models/top.glb',
    '/models/bottom.glb',
    '/models/base-inner.glb',
    '/models/base-outer.glb'
  ]

  const centerPanel = (
    <div style={{ flex: 1.1, padding: 20, display: windowWidth < 800 && activePanel !== 'center' ? 'none' : 'block', zIndex: 2 }}>
      <Suspense fallback={<div>Loading Avatar...</div>}>
        {mode === 'focused' ? (
          <FocusedAvatar key={avatarKey} />
        ) : (
          <FullBodyAvatar key={avatarKey} modelPaths={gridMode ? fullBodyModels : ['/models/full-body.glb']} />
        )}
      </Suspense>
      <button onClick={toggleMode} style={{ marginTop: 12 }}>Toggle Fit</button>
      {mode === 'full-body' && (
        <button onClick={() => setGridMode(!gridMode)} style={{ marginLeft: 10 }}>Layout/Grid View</button>
      )}
      <AvatarClothingSelector />
      {!user ? (
        <div style={{ background: '#181825', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 0 20px #0af', width: '100%', maxWidth: 360 }}>
          <h2 style={{ color: '#0af', marginBottom: 12 }}>{signupMode ? "🟢 Create Account" : "🔐 Log In"}</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSignupError('');
              const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
              const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value
              if (signupMode) {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) setSignupError(error.message)
                else window.location.reload()
              } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) setSignupError(error.message)
                else window.location.reload()
              }
            }}
          >
            <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: 10, marginBottom: 10, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }} />
            <input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: 10, marginBottom: 10, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }} />
            <button type="submit" style={{ background: '#0af', color: '#000', padding: '10px 16px', borderRadius: 6, fontWeight: 'bold', width: '100%' }}>
              {signupMode ? "Create Account" : "Login"}
            </button>
            <button
              type="button"
              onClick={() => { setSignupMode(!signupMode); setSignupError('') }}
              style={{ background: 'transparent', color: '#0af', marginTop: 8, width: '100%' }}
            >
              {signupMode ? "← Back to Login" : "Need an account? Sign Up"}
            </button>
            {signupError && <div style={{ color: '#ff4d4f', marginTop: 10 }}>{signupError}</div>}
          </form>
        </div>
      ) : (
        <div style={{
          background: '#181825',
          padding: 24,
          borderRadius: 12,
          marginTop: 24,
          marginBottom: 24,
          boxShadow: '0 2px 24px #0af3',
          color: '#fff'
        }}>
          <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
            👤 Welcome, {user?.email}
          </h2>
          <p style={{ margin: 0, color: '#aaa', fontSize: 14 }}>
            Account ID: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user?.id.slice(0, 12)}...</span>
          </p>
          <div style={{ margin: '20px 0' }}>
            <Link href="/transactions" style={{ color: '#0af', marginRight: 24 }}>Transactions</Link>
            <Link href="/receipt" style={{ color: '#0af', marginRight: 24 }}>Receipts</Link>
            {user.email === ADMIN_EMAIL && (
              <>
                <Link href="/admin/dashboard" className="text-blue-500 hover:underline" style={{ marginRight: 24 }}>
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {}}
                  disabled={refreshing}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    background: refreshing ? '#999' : '#10b981',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                    marginLeft: 12
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Manual Market Refresh'}
                </button>
                {message && (
                  <p style={{ marginTop: 10, color: message.startsWith('✅') ? 'green' : 'red' }}>
                    {message}
                  </p>
                )}
              </>
            )}
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.reload()
            }}
            style={{
              background: '#0af',
              color: '#000',
              borderRadius: 6,
              padding: '10px 16px',
              fontWeight: 'bold',
              marginTop: 16
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );

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

  return (
    <div style={{
      display: windowWidth < 800 ? "block" : "flex",
      height: "100vh",
      flexDirection: windowWidth < 800 ? "column" : "row",
      position: "relative",
      background: "linear-gradient(130deg, #0af2 0%, #191c24 55%, #222f 100%)"
    }}>
      <AnimatedBG />

      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#181825', padding: 10 }}>
          <button onClick={() => setActivePanel('left')} style={{ color: activePanel === 'left' ? '#0af' : '#fff', fontWeight: 'bold', flex: 1 }}>Coins</button>
          <button onClick={() => setActivePanel('center')} style={{ color: activePanel === 'center' ? '#0af' : '#fff', fontWeight: 'bold', flex: 1 }}>Profile</button>
          <button onClick={() => setActivePanel('right')} style={{ color: activePanel === 'right' ? '#0af' : '#fff', fontWeight: 'bold', flex: 1 }}>Suite</button>
        </div>
      )}

      {/* PANELS */}
      {(windowWidth >= 800 || activePanel === 'left') && leftPanel}
      {(windowWidth >= 800 || activePanel === 'center') && centerPanel}
      {(windowWidth >= 800 || activePanel === 'right') && rightPanel}

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
