// pages/business.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import LogoRotator from "@/components/LogoRotator";

const ADMIN_EMAIL = "your-admin@email.com";

const businessOptions = [
  {
    key: "artist-coin",
    name: "Artist Hosting",
    price: 0,
    description: "Launch your own creator coin, earn dividends, sell products. Investors can support your coin.",
    features: ["Free statistics", "Coin onboarding", "Investor support", "Dividends"],
    button: "Create Coin",
    stripe: false,
    formFields: [
      { name: "coinName", label: "Coin Name", type: "text", required: true },
      { name: "coinScope", label: "Scope/Role", type: "text", required: true },
      { name: "coinProjects", label: "Projects/Products (comma-separated)", type: "text", required: false },
      { name: "coinDividends", label: "Enable Dividends", type: "checkbox", required: false }
    ]
  },
  {
    key: "simple-site",
    name: "Simple Website",
    price: 1000,
    description: "Flat $1000. Sell your work, music, merch. Stripe integration and custom branding.",
    features: ["Flat fee", "Stripe integration", "Custom domain", "Shop-ready"],
    button: "Get Site",
    stripe: true,
    formFields: [
      { name: "siteName", label: "Site/App Name", type: "text", required: true },
      { name: "sitePurpose", label: "Purpose", type: "text", required: true },
      { name: "siteCompany", label: "Company Name", type: "text", required: false },
      { name: "siteRole", label: "Your Role", type: "text", required: false }
    ]
  },
  {
    key: "custom-app",
    name: "Custom App & Consultation",
    price: 1000,
    description: "Custom app, features, quote based on needs. $1000+ & 10% revenue share for complex apps.",
    features: ["Consulting", "App features", "Quote-based", "Revenue share"],
    button: "Get a Quote",
    stripe: true,
    formFields: [
      { name: "customAppName", label: "App/Company Name", type: "text", required: true },
      { name: "customAppPurpose", label: "Purpose/Use Case", type: "text", required: true },
      { name: "customAppFeatures", label: "Features (comma-separated)", type: "text", required: false },
      { name: "customAppPayDate", label: "Preferred Payment Date", type: "date", required: false }
    ]
  }
];

export default function Business() {
  const [user, setUser] = useState<any>(null);
  const [onboard, setOnboard] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const [formState, setFormState] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Open modal and reset form state
  const handleOpenModal = (option: any) => {
    setModalInfo(option);
    setFormState({});
  };

  // Universal handler for modal forms
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Submit form per option (save in Supabase, then payment)
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    setLoading(true);
    try {
      if (modalInfo.key === "artist-coin") {
        // Save coin info in Supabase
        const { data: coin, error } = await supabase
          .from("aura_coins")
          .insert({
            name: formState.coinName,
            scope: formState.coinScope,
            dividends_eligible: !!formState.coinDividends,
            projects: formState.coinProjects?.split(",").map((s: string) => s.trim()),
            user_id: user.id,
          })
          .select().single();
        if (error) throw error;
        await supabase.from("activities").insert({
          user_id: user.id,
          type: "onboarding",
          action: "Created Coin",
          details: JSON.stringify({ coin_id: coin.id }),
          status: "present",
          created_at: new Date().toISOString()
        });
        await supabase.from("contracts").insert({
          parties: [user.id, ADMIN_EMAIL],
          type: "artist-coin",
          status: "active",
          start: new Date().toISOString(),
          details: JSON.stringify({ coin_id: coin.id })
        });
        alert("Artist Coin and onboarding contract created!");
        setModalInfo(null);
      } else if (modalInfo.key === "simple-site") {
        // Save site info
        await supabase.from("activities").insert({
          user_id: user.id,
          type: "simple-site-order",
          details: JSON.stringify({ ...formState }),
          status: "pending",
          created_at: new Date().toISOString()
        });
        // Stripe checkout
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: modalInfo.price, userId: user.id, ...formState }),
        });
        const json = await res.json();
        if (json.sessionId) {
          const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
          (await stripe)?.redirectToCheckout({ sessionId: json.sessionId });
        }
        setModalInfo(null);
      } else if (modalInfo.key === "custom-app") {
        // Save custom app info
        await supabase.from("activities").insert({
          user_id: user.id,
          type: "custom-app-quote",
          details: JSON.stringify({ ...formState }),
          status: "pending",
          created_at: new Date().toISOString()
        });
        // Stripe checkout
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: modalInfo.price, userId: user.id, ...formState }),
        });
        const json = await res.json();
        if (json.sessionId) {
          const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
          (await stripe)?.redirectToCheckout({ sessionId: json.sessionId });
        }
        setModalInfo(null);
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  const addToCart = (key: string) => setCart(prev => [...prev, key]);

  return (
    <div style={{
      minHeight: "140vh",
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
          "/screenshots/Logo4.png",
          "/screenshots/Logo5.png",
          "/screenshots/Logo6.png",
          "/screenshots/Logo7.png",
          "/screenshots/Logo8.png"
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
                onClick={() => handleOpenModal(option)}
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

      {/* MODAL */}
      {modalInfo && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#0007", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <form onSubmit={handleSubmitModal} style={{
            background: "#fff",
            padding: 40,
            borderRadius: 16,
            minWidth: 330,
            maxWidth: "94vw",
            boxShadow: "0 8px 48px #0af6"
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 23, marginBottom: 18 }}>{modalInfo.name} – Details</h2>
            {modalInfo.formFields.map((field: any) => (
              <div key={field.name} style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>
                  {field.label}
                  {field.required && <span style={{ color: "#e44", marginLeft: 4 }}>*</span>}
                </label>
                {field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!formState[field.name]}
                    onChange={handleFormChange}
                    style={{ transform: "scale(1.3)", marginTop: 5 }}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formState[field.name] || ""}
                    required={field.required}
                    onChange={handleFormChange}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 7,
                      border: "1.5px solid #abc",
                      width: "100%",
                      fontSize: 16
                    }}
                  />
                )}
              </div>
            ))}
            <div style={{ marginTop: 28, display: "flex", gap: 14 }}>
              <button type="submit" disabled={loading} style={{
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 8,
                border: "none",
                padding: "13px 26px",
                fontSize: 17,
                flex: 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}>
                {loading ? "Processing..." : "Submit"}
              </button>
              <button type="button" onClick={() => setModalInfo(null)} style={{
                background: "#fff",
                border: "2px solid #2563eb",
                color: "#2563eb",
                fontWeight: 600,
                borderRadius: 8,
                padding: "13px 22px",
                fontSize: 17,
                flex: 1,
                cursor: "pointer"
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
