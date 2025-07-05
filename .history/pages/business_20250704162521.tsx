// pages/business.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import LogoRotator from "@/components/LogoRotator";

const ADMIN_EMAIL = "burks.donte@gmail.com";

const businessOptions = [
  {
    key: "artist-coin",
    name: "Artist Hosting",
    price: 0,
    description: "Launch your own creator coin, earn dividends, sell products. Investors can support your coin.",
    features: ["Free statistics", "Coin onboarding", "Investor support", "Dividends"],
    button: "Create Coin",
    stripe: false,
  },
  {
    key: "simple-site",
    name: "Simple Website",
    price: 1000,
    description: "Flat $1000. Sell your work, music, merch. Stripe integration and custom branding.",
    features: ["Flat fee", "Stripe integration", "Custom domain", "Shop-ready"],
    button: "Get Site",
    stripe: true,
  },
  {
    key: "custom-app",
    name: "Custom App & Consultation",
    price: 1000,
    description: "Custom app, features, quote based on needs. $1000+ & 10% revenue share for complex apps.",
    features: ["Consulting", "App features", "Quote-based", "Revenue share"],
    button: "Get a Quote",
    stripe: true,
  },
];

export default function Business() {
  const [user, setUser] = useState<any>(null);
  const [onboard, setOnboard] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const router = useRouter();

  // Fetch user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Purchase handlers (reuse your logic as in prior file)
  const handlePurchase = async (option: any) => {
    if (!user) {
      alert("Please sign in to purchase.");
      return;
    }
    setLoading(true);
    if (option.key === "artist-coin") {
      // Insert onboarding logic here as before...
      alert("Artist Coin onboarding! (demo)");
      setLoading(false);
      return;
    }
    // Stripe purchase
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: option.price, userId: user.id, product: option.name }),
    });
    const json = await res.json();
    if (json.sessionId) {
      const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      (await stripe)?.redirectToCheckout({ sessionId: json.sessionId });
    }
    setLoading(false);
  };

  // Add to Cart (demo; you can expand this logic)
  const addToCart = (key: string) => {
    setCart(prev => [...prev, key]);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7fafd",
      fontFamily: "Inter, sans-serif",
      padding: "36px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Logo Rotator */}
      <LogoRotator
        images={[
          "/screenshots/Logo1.png",
          "/screenshots/Logo2.png",
          "/screenshots/Logo3.png",
          "/screenshots/Logo4.png"
        ]}
        size={88}
        interval={900}
      />

      <h1 style={{
        fontSize: 36,
        fontWeight: 700,
        margin: "28px 0 12px 0",
        color: "#12395f",
        textAlign: "center"
      }}>
        Business Solutions
      </h1>
      <p style={{ fontSize: 18, color: "#567", marginBottom: 38, textAlign: "center", maxWidth: 680 }}>
        Pick the option that fits your vision. Fast onboarding, flexible ownership, real payments. Secure and easy.
      </p>

      {/* Pricing Cards */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 28,
        maxWidth: 1200,
        width: "100%",
      }}>
        {businessOptions.map(option => (
          <div key={option.key}
            style={{
              background: "#fff",
              border: "2.5px solid #1d5dfa08",
              boxShadow: option.key === "simple-site" ? "0 0 0 2.5px #2563eb99, 0 4px 30px #0af3" : "0 1.5px 18px #d2e0f8a0",
              borderRadius: 18,
              padding: "36px 32px 32px 32px",
              minWidth: 300,
              flex: "1 0 310px",
              maxWidth: 370,
              transition: "box-shadow 0.18s",
              position: "relative"
            }}
          >
            {option.key === "simple-site" && (
              <div style={{
                position: "absolute",
                top: 12, left: "50%", transform: "translateX(-50%)",
                background: "#2563eb", color: "#fff", padding: "4px 16px",
                borderRadius: 20, fontWeight: 700, fontSize: 15
              }}>
                Most Popular
              </div>
            )}
            <div style={{ marginTop: option.key === "simple-site" ? 34 : 0 }}>
              <h2 style={{ fontWeight: 700, fontSize: 25, color: "#1d2e45" }}>{option.name}</h2>
              <div style={{ fontSize: 28, fontWeight: 800, margin: "18px 0 6px", color: "#2563eb" }}>
                {option.price === 0 ? "$0" : `$${option.price}`}
                <span style={{ fontSize: 16, color: "#567", fontWeight: 400, marginLeft: 2 }}>
                  {option.price === 0 ? "" : "one-time"}
                </span>
              </div>
              <p style={{ color: "#333", minHeight: 48, fontSize: 16 }}>{option.description}</p>
              <ul style={{ padding: "0 0 0 18px", color: "#165" }}>
                {option.features.map((feat, i) => <li key={i} style={{ marginBottom: 3 }}>{feat}</li>)}
              </ul>
              <button
                onClick={() => handlePurchase(option)}
                disabled={loading}
                style={{
                  marginTop: 18,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 8,
                  border: "none",
                  padding: "14px 30px",
                  fontSize: 18,
                  width: "100%",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 1.5px 10px #0050fc10"
                }}>
                {option.button}
              </button>
              <button
                onClick={() => addToCart(option.key)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  border: "2px solid #2563eb",
                  background: "#fff",
                  color: "#2563eb",
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: "10px 0",
                  fontSize: 16,
                  cursor: "pointer"
                }}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Cart status */}
      {cart.length > 0 && (
        <div style={{
          marginTop: 30,
          background: "#e5f0fa",
          borderRadius: 10,
          padding: "14px 30px",
          fontSize: 17,
          color: "#2b3d54",
          boxShadow: "0 1px 8px #0af1"
        }}>
          Added to cart: {cart.join(", ")}
        </div>
      )}
    </div>
  );
}
