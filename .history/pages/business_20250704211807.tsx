// pages/business.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import LogoRotator from "@/components/LogoRotator";
import { getOrCreateUserCoin } from "@/utils/getOrCreateUserCoin";

const ADMIN_EMAIL = "";

// --- Types ---
type BusinessOption = {
  key: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  button: string;
  formFields: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
  }[];
};

type ModalInfo = BusinessOption | null;

const businessOptions: BusinessOption[] = [
  {
    key: "artist-coin",
    name: "Artist Coin",
    price: 0,
    description: "Create your own coin for free.",
    features: ["No cost", "Instant setup", "Onboarding contract"],
    button: "Create Coin",
    formFields: [
      { name: "coinName", label: "Coin Name", type: "text", required: true },
      { name: "coinScope", label: "Scope", type: "text", required: true },
      { name: "coinDividends", label: "Eligible for Dividends", type: "checkbox" },
      { name: "coinProjects", label: "Projects (comma separated)", type: "text" },
    ],
  },
  {
    key: "simple-site",
    name: "Simple Site",
    price: 99,
    description: "A simple website for your business.",
    features: ["1-page site", "Contact form", "Custom domain"],
    button: "Start Simple Site",
    formFields: [
      { name: "siteName", label: "Site Name", type: "text", required: true },
      { name: "siteEmail", label: "Contact Email", type: "email", required: true },
    ],
  },
  {
    key: "custom-app",
    name: "Custom App",
    price: 499,
    description: "A custom app tailored to your needs.",
    features: ["Custom features", "Full support", "Mobile-ready"],
    button: "Request Custom App",
    formFields: [
      { name: "appName", label: "App Name", type: "text", required: true },
      { name: "appDetails", label: "Details", type: "textarea", required: true },
    ],
  },
];

export default function Business() {
  const [user, setUser] = useState<any>(undefined); // undefined = loading
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Type-safe change handler for checkboxes and other inputs
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (
      type === "checkbox" &&
      e.target instanceof HTMLInputElement // ensures .checked is valid
    ) {
      setFormState((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOpenModal = (option: BusinessOption) => {
    setModalInfo(option);
    setFormState({});
  };

  // Handles all onboarding/payment logic, ensures coin is present
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    setLoading(true);

    try {
      if (modalInfo?.key === "artist-coin") {
        // Artist Coin is free, create coin and contracts
        const { data: coin, error } = await supabase
          .from("aura_coins")
          .insert({
            coinName: formState.coinName,
            symbol: formState.coinName?.slice(0, 8)?.toUpperCase() || "COIN",
            scopes: [formState.coinScope],
            dividends_eligible: !!formState.coinDividends,
            projects: formState.coinProjects?.split(",").map((s: string) => s.trim()),
            user_id: user.id,
            active: false,
            owner_name: user.email,
          })
          .select()
          .single();
        if (error) throw error;

        await supabase.from("activities").insert({
          user_id: user.id,
          type: "onboarding",
          action: "Created Coin",
          details: JSON.stringify({ coin_id: coin.id }),
          status: "present",
          created_at: new Date().toISOString(),
        });
        await supabase.from("contracts").insert({
          parties: [user.id, ADMIN_EMAIL],
          type: "artist-coin",
          status: "active",
          start: new Date().toISOString(),
          details: JSON.stringify({ coin_id: coin.id }),
        });
        alert("Artist Coin and onboarding contract created!");
        setModalInfo(null);
      } else if (modalInfo) {
        // Paid product: always get/create user coin first!
        const coinId = await getOrCreateUserCoin(user);

        await supabase.from("activities").insert({
          user_id: user.id,
          type: modalInfo.key,
          details: JSON.stringify({ ...formState, coinId }),
          status: "pending",
          created_at: new Date().toISOString(),
        });

        // Stripe Checkout (send coinId, amount, userId)
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coinId,
            amount: modalInfo.price,
            userId: user.id,
            ...formState,
          }),
        });
        const json = await res.json();
        if (json.sessionId) {
          const stripe = await (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
          await stripe?.redirectToCheckout({ sessionId: json.sessionId });
        } else {
          alert(json.error || "Failed to start payment. Try again.");
        }
        setModalInfo(null);
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  const addToCart = (key: string) => setCart(prev => [...prev, key]);

  // --- User loading & sign-in gating ---
  if (user === undefined) {
    return <div style={{ padding: 36, textAlign: "center" }}>Loading...</div>;
  }
  if (!user) {
    return (
      <div style={{ padding: 36, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
        <h2>Sign In Required</h2>
        <p>You must be signed in to use business onboarding.</p>
        <a href="/login">
          <button style={{
            padding: "12px 26px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            fontWeight: 700,
            fontSize: 18
          }}>
            Go to Sign In
          </button>
        </a>
      </div>
    );
  }

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
        {businessOptions.map((option) => (
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
            {modalInfo.formFields.map((field) => (
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
                ) : field.type === "textarea" ? (
                  <textarea
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
