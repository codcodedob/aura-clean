// pages/contracts.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

const ADMIN_EMAIL = "your-admin@email.com"; // <-- set your admin email
const SCOPE_OPTIONS = [
  "Music Artist", "Multi-medium Artist", "Streamer", "Content/Public Figure", "Designer",
  "Inventor", "Producer (Film)", "Producer (Music)", "Writer (Film)", "Writer (Music)"
];
const FEATURES = [
  "Audio/video streaming", "NFT/digital product sales", "Fan/creator messaging",
  "Mobile-ready", "Community chat/forum", "Analytics dashboard", "Investor dashboard/coins", "Merchandise shop"
];
export default function Contracts() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<null | "signup" | "login">(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [onboard, setOnboard] = useState<null | "artist-coin" | "simple-site" | "custom-app">(null);
  // Option 1: Artist Coin state
  const [coinName, setCoinName] = useState("");
  const [coinScope, setCoinScope] = useState<string[]>([]);
  const [coinDividends, setCoinDividends] = useState(false);
  const [coinProjects, setCoinProjects] = useState<string[]>([]);
  // Option 2: Simple Site state
  const [siteName, setSiteName] = useState("");
  const [sitePurpose, setSitePurpose] = useState("");
  const [siteCompany, setSiteCompany] = useState("");
  const [siteRole, setSiteRole] = useState("");
  const [siteStripeSession, setSiteStripeSession] = useState<string | null>(null);
  // Option 3: Custom App state
  const [customAppName, setCustomAppName] = useState("");
  const [customAppPurpose, setCustomAppPurpose] = useState("");
  const [customAppFeatures, setCustomAppFeatures] = useState<string[]>([]);
  const [customAppCompany, setCustomAppCompany] = useState("");
  const [customAppRole, setCustomAppRole] = useState("");
  const [customAppPayDate, setCustomAppPayDate] = useState("");
  const [customAppQuote, setCustomAppQuote] = useState<number | null>(null);

  const router = useRouter();

  // Fetch user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setAuthMode(data?.user ? null : "signup");
    });
    // TODO: fetch contracts from supabase for logged-in user
  }, []);

  // Auth handlers
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: { data: { username: authUsername } }
    });
    if (!error) {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      setAuthMode(null);
    } else {
      alert(error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (!error) {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      setAuthMode(null);
    } else {
      alert(error.message);
    }
  };
  // Option 1: Go Public (Artist Coin)
  const handleArtistCoin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Insert coin in supabase
    const { data: coin, error } = await supabase
      .from("aura_coins")
      .insert({
        name: coinName,
        scope: coinScope,
        dividends_eligible: coinDividends,
        projects: coinProjects,
        user_id: user.id,
      })
      .select().single();
    if (error) return alert(error.message);

    // Insert onboarding activity
    await supabase.from("activities").insert({
      user_id: user.id,
      type: "onboarding",
      action: "Created Coin",
      details: JSON.stringify({ coin_id: coin.id }),
      status: "present",
      created_at: new Date().toISOString()
    });
    // Insert contract with admin
    await supabase.from("contracts").insert({
      parties: [user.id, ADMIN_EMAIL],
      type: "artist-coin",
      status: "active",
      start: new Date().toISOString(),
      details: JSON.stringify({ coin_id: coin.id })
    });
    setOnboard(null);
    alert("Coin and onboarding contract created! (demo)");
  };

  // Option 2: Simple Site
  const handleSimpleSite = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call Stripe endpoint, get sessionId, redirect to checkout
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1000, userId: user.id, siteName, sitePurpose, siteCompany, siteRole })
    });
    const json = await res.json();
    if (json.sessionId) {
      setSiteStripeSession(json.sessionId);
      const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      (await stripe)?.redirectToCheckout({ sessionId: json.sessionId });
    }
    // In webhook: create contract/receipt/activity on payment success.
    setOnboard(null);
  };

  // Option 3: Pro Custom App
  const calcQuote = () => 1000 + (customAppFeatures.length * 200);
  const handleCustomApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomAppQuote(calcQuote());
    // If pay now, show Stripe. If pay later, create contract/activity in future.
    if (customAppPayDate && new Date(customAppPayDate) > new Date()) {
      await supabase.from("contracts").insert({
        parties: [user.id, ADMIN_EMAIL],
        type: "custom-app",
        status: "future",
        start: customAppPayDate,
        details: JSON.stringify({ app: customAppName, features: customAppFeatures })
      });
      await supabase.from("activities").insert({
        user_id: user.id,
        type: "custom-app-quote",
        action: "Scheduled Payment",
        status: "future",
        details: JSON.stringify({ app: customAppName, payDate: customAppPayDate, quote: calcQuote() }),
        created_at: new Date().toISOString()
      });
      setOnboard(null);
      alert("Quote scheduled! We'll contact you to finalize payment.");
    } else {
      // Stripe checkout
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: calcQuote(), userId: user.id, app: customAppName })
      });
      const json = await res.json();
      if (json.sessionId) {
        const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        (await stripe)?.redirectToCheckout({ sessionId: json.sessionId });
      }
      setOnboard(null);
    }
  };
  if (!user) {
    return (
      <div style={{ padding: 36, maxWidth: 400, margin: "0 auto" }}>
        <h2>Sign Up / Log In</h2>
        <form onSubmit={authMode === "signup" ? handleSignUp : handleLogin}>
          <input placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required style={{ marginBottom: 8, width: "100%" }} />
          <input placeholder="Password" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required style={{ marginBottom: 8, width: "100%" }} />
          {authMode === "signup" && (
            <input placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required style={{ marginBottom: 8, width: "100%" }} />
          )}
          <button type="submit" style={{ width: "100%", marginBottom: 10, background: "#0af", color: "#fff", fontWeight: 600, padding: 10, border: "none", borderRadius: 8 }}>
            {authMode === "signup" ? "Sign Up" : "Log In"}
          </button>
        </form>
        <button style={{ color: "#0af", background: "#fff", border: "none" }} onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}>
          {authMode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", padding: 36 }}>
      <h1>Contracts & Onboarding</h1>
      <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginBottom: 40, justifyContent: "center" }}>
        {/* Go Public */}
        <div style={{ flex: "1 0 240px", background: "#f9fafe", border: "2px solid #0af2", borderRadius: 16, padding: 26, boxShadow: "0 2px 16px #0af1" }}>
          <h2>Go Public – Artist Hosting & Coin</h2>
          <p>Launch your own creator coin, earn dividends, sell products. Investors can support your coin.</p>
          <button onClick={() => setOnboard("artist-coin")} style={{ background: "#0af", color: "#fff", borderRadius: 8, padding: "12px 28px", fontWeight: 600, marginTop: 14, border: "none" }}>Create Coin</button>
        </div>
        {/* Simple Site */}
        <div style={{ flex: "1 0 240px", background: "#f9fafe", border: "2px solid #0af2", borderRadius: 16, padding: 26, boxShadow: "0 2px 16px #0af1" }}>
          <h2>Simple Custom Site</h2>
          <p>Flat $1000. Sell your work, music, merch. Stripe integration and custom branding.</p>
          <button onClick={() => setOnboard("simple-site")} style={{ background: "#0af", color: "#fff", borderRadius: 8, padding: "12px 28px", fontWeight: 600, marginTop: 14, border: "none" }}>Get Site</button>
        </div>
        {/* Custom App */}
        <div style={{ flex: "1 0 240px", background: "#f9fafe", border: "2px solid #0af2", borderRadius: 16, padding: 26, boxShadow: "0 2px 16px #0af1" }}>
          <h2>Pro Custom App & Consultation</h2>
          <p>Custom app, features, quote based on needs. $1000+ & 10% revenue share for complex apps.</p>
          <button onClick={() => setOnboard("custom-app")} style={{ background: "#0af", color: "#fff", borderRadius: 8, padding: "12px 28px", fontWeight: 600, marginTop: 14, border: "none" }}>Get a Quote</button>
        </div>
      </div>

      {/* Modal flows */}
      {onboard === "artist-coin" && (
        <div style={modalStyle}>
          <form style={modalFormStyle} onSubmit={handleArtistCoin}>
            <h2>Go Public: Artist Coin Onboarding</h2>
            <input placeholder="Coin Name" value={coinName} onChange={e => setCoinName(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
            <label>
              Describe your scope:
              <select multiple value={coinScope} onChange={e => setCoinScope(Array.from(e.target.selectedOptions).map(o => o.value))} style={{ width: "100%", minHeight: 90, marginBottom: 12 }}>
                {SCOPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Add Project/Product IDs (comma-separated):<br />
              <input value={coinProjects.join(",")} onChange={e => setCoinProjects(e.target.value.split(","))} style={{ width: "100%", marginBottom: 12 }} />
            </label>
            <label>
              <input type="checkbox" checked={coinDividends} onChange={e => setCoinDividends(e.target.checked)} /> Enable Dividends for Investors
            </label>
            <button type="submit" style={primaryBtn}>Submit</button>
            <button type="button" style={secondaryBtn} onClick={() => setOnboard(null)}>Cancel</button>
          </form>
        </div>
      )}
      {onboard === "simple-site" && (
        <div style={modalStyle}>
          <form style={modalFormStyle} onSubmit={handleSimpleSite}>
            <h2>Simple Site Order</h2>
            <input placeholder="Site/App Name" value={siteName} onChange={e => setSiteName(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
            <input placeholder="Purpose" value={sitePurpose} onChange={e => setSitePurpose(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
            <input placeholder="Company Name" value={siteCompany} onChange={e => setSiteCompany(e.target.value)} style={{ width: "100%", marginBottom: 12 }} />
            <input placeholder="Your Role" value={siteRole} onChange={e => setSiteRole(e.target.value)} style={{ width: "100%", marginBottom: 12 }} />
            <div style={{ margin: "12px 0" }}><strong>Flat Fee: $1000 (Stripe payment next)</strong></div>
            <button type="submit" style={primaryBtn}>Pay with Stripe</button>
            <button type="button" style={secondaryBtn} onClick={() => setOnboard(null)}>Cancel</button>
          </form>
        </div>
      )}
      {onboard === "custom-app" && (
        <div style={modalStyle}>
          <form style={modalFormStyle} onSubmit={handleCustomApp}>
            <h2>Custom App Consultation</h2>
            <input placeholder="App/Company Name" value={customAppName} onChange={e => setCustomAppName(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
            <input placeholder="Purpose/Use Case" value={customAppPurpose} onChange={e => setCustomAppPurpose(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
            <input placeholder="Organization" value={customAppCompany} onChange={e => setCustomAppCompany(e.target.value)} style={{ width: "100%", marginBottom: 12 }} />
            <input placeholder="Your Role" value={customAppRole} onChange={e => setCustomAppRole(e.target.value)} style={{ width: "100%", marginBottom: 12 }} />
            <div>Features:</div>
            <div style={{ marginBottom: 12 }}>
              {FEATURES.map(f => (
                <label key={f} style={{ display: "block" }}>
                  <input type="checkbox" checked={customAppFeatures.includes(f)} onChange={e => {
                    setCustomAppFeatures(fs => e.target.checked ? [...fs, f] : fs.filter(x => x !== f))
                  }} />
                  {f}
                </label>
              ))}
            </div>
            <label>
              <strong>When do you want to pay?</strong>
              <input type="date" value={customAppPayDate} onChange={e => setCustomAppPayDate(e.target.value)} style={{ marginLeft: 8 }} />
            </label>
            <div style={{ margin: "16px 0" }}>
              <strong>Instant Quote: ${calcQuote()} + 10% revenue (Stripe for instant pay, or schedule)</strong>
            </div>
            <button type="submit" style={primaryBtn}>Submit</button>
            <button type="button" style={secondaryBtn} onClick={() => setOnboard(null)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Custom Contract Create Tool */}
      <div style={{ marginTop: 36 }}>
        <button style={primaryBtn} onClick={() => router.push("/contracts/create")}>
          + Create Custom Contract
        </button>
      </div>

      {/* Contract list (TODO: fetch real data) */}
      <h2 style={{ marginTop: 50 }}>Your Contracts</h2>
      <div style={{ background: "#fafcff", borderRadius: 12, padding: 16, minHeight: 120, boxShadow: "0 1px 8px #0001" }}>
        {/* Replace with mapped data */}
        <p>Demo: All your contracts will appear here, with status, parties, payouts, negotiation/counter-offer tools.</p>
      </div>
    </div>
  );
}

// --- Styles ---
const modalStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0005", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" };
const modalFormStyle: React.CSSProperties = { background: "#fff", padding: 30, borderRadius: 16, width: 410, maxWidth: "90vw" };
const primaryBtn: React.CSSProperties = { background: "#0af", color: "#fff", fontWeight: 600, border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 18, marginRight: 12 };
const secondaryBtn: React.CSSProperties = { background: "#fff", color: "#0af", fontWeight: 500, border: "1.5px solid #0af", borderRadius: 8, padding: "11px 28px", fontSize: 17 };

