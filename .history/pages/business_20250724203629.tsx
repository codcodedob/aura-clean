import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoRotator from "@/components/LogoRotator";
import { getOrCreateUserCoin } from "@/utils/getOrCreateUserCoin";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";
import AuthPanel from "@/components/AuthPanel";
import Link from "next/link";

const ADMIN_EMAIL = "";

type FormState = {
  [key: string]: string | boolean | string[] | undefined;
};

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

const businessOptions: BusinessOption[] = [
  {
    key: "artist-coin",
    name: "Artist Coin",
    price: 0,
    description: "Create your own coin for free.",
    features: ["No cost", "Instant setup", "Onboarding contract"],
    button: "Create Coin",
    formFields: [
      { name: "name", label: "Coin Name", type: "text", required: true },
      { name: "coinDividends", label: "Eligible for Dividends", type: "checkbox" },
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

export default function Business(): React.JSX.Element {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [modalInfo, setModalInfo] = useState<BusinessOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({});
  const [enteractives, setEnteractives] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    supabase.from("enteractives").select("name").then(({ data }) => {
      if (data) setEnteractives(data.map((x) => x.name));
    });
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenModal = (option: BusinessOption) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setModalInfo(option);
    setFormState({});
  };

  const handleSubmitModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      alert("Please sign in first.");
      return;
    }
    setLoading(true);
    try {
      if (modalInfo?.key === "artist-coin") {
        const { data: coin, error } = await supabase
          .from("aura_coins")
          .insert({
            owner_name: user.email ?? "",
            name: formState.name as string,
            symbol: (formState.name as string)?.slice(0, 8)?.toUpperCase() || "COIN",
            scope: (formState.scope as string[]) ?? [],
            dividend_eligible: !!formState.coinDividends,
            user_id: user.id,
            active: false,
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from("activities").insert({
          user_id: user.id,
          type: "onboarding",
          action: "Created Coin",
          details: JSON.stringify({ coin_id: coin?.id }),
          status: "present",
          created_at: new Date().toISOString(),
        });

        await supabase.from("contracts").insert({
          parties: [user.id, ADMIN_EMAIL],
          type: "artist-coin",
          status: "active",
          start: new Date().toISOString(),
          details: JSON.stringify({ coin_id: coin?.id }),
        });

        alert("Artist Coin and onboarding contract created!");
        setModalInfo(null);
        router.push("/dobemosaic");
      } else if (modalInfo) {
        const coinId = await getOrCreateUserCoin(user);

        await supabase.from("activities").insert({
          user_id: user.id,
          type: modalInfo.key,
          details: JSON.stringify({ ...formState, coinId }),
          status: "pending",
          created_at: new Date().toISOString(),
        });

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
          const stripeModule = await import("@stripe/stripe-js");
          const stripe = await stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
          await stripe?.redirectToCheckout({ sessionId: json.sessionId });
        } else {
          alert(json.error || "Failed to start payment.");
        }
        setModalInfo(null);
      }
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "140vh", background: "#111", padding: "36px 0", color: "#eee" }}>
      <LogoRotator
        images={[
          "/screenshots/Logo1.png",
          "/screenshots/Logo2.png",
          "/screenshots/Logo3.png",
          "/screenshots/Logo4.png",
          "/screenshots/Logo5.png",
        ]}
        size={88}
        interval={900}
      />
      <h1 style={{ fontSize: 36, fontWeight: 700, margin: "28px 0 12px" }}>Business Solutions</h1>
      <p style={{ fontSize: 18, marginBottom: 38, textAlign: "center", maxWidth: 680, marginInline: "auto" }}>
        Pick the option that fits your vision. Fast onboarding, real payments.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 28, maxWidth: 1200, marginInline: "auto" }}>
        {businessOptions.map((option) => (
          <div key={option.key} style={{ background: "#222", border: "2px solid #444", borderRadius: 18, padding: "36px 32px", minWidth: 300, maxWidth: 370 }}>
            <h2 style={{ fontSize: 24 }}>{option.name}</h2>
            <div style={{ fontSize: 28, fontWeight: 800, margin: "18px 0 6px" }}>
              {option.price === 0 ? "$0" : `$${option.price}`}
            </div>
            <p>{option.description}</p>
            <ul style={{ padding: "0 0 0 18px", textAlign: "left" }}>
              {option.features.map((feat, i) => <li key={i}>{feat}</li>)}
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
                padding: "14px 30px",
                width: "100%",
                fontSize: 18,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {option.button}
            </button>
          </div>
        ))}
      </div>

      {modalInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0007", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <form onSubmit={handleSubmitModal} style={{ background: "#222", color: "#eee", padding: 40, borderRadius: 16, minWidth: 330, maxWidth: "94vw", boxShadow: "0 8px 48px #0af6" }}>
            <h2 style={{ fontWeight: 700, fontSize: 23, marginBottom: 18 }}>{modalInfo.name} – Details</h2>
            {modalInfo.formFields.map((field) => (
              <div key={field.name} style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, fontSize: 16, display: "block", marginBottom: 6 }}>
                  {field.label}{field.required && <span style={{ color: "#e44", marginLeft: 4 }}>*</span>}
                </label>
                {field.type === "checkbox" ? (
                  <input type="checkbox" name={field.name} checked={!!formState[field.name]} onChange={handleFormChange} style={{ transform: "scale(1.3)", marginTop: 5 }} />
                ) : field.type === "textarea" ? (
                  <textarea name={field.name} value={formState[field.name] as string || ""} required={field.required} onChange={handleFormChange} style={{ padding: "10px", borderRadius: 6, background: "#111", border: "1px solid #444", color: "#eee", width: "100%" }} />
                ) : (
                  <input type={field.type} name={field.name} value={formState[field.name] as string || ""} required={field.required} onChange={handleFormChange} style={{ padding: "10px", borderRadius: 6, background: "#111", border: "1px solid #444", color: "#eee", width: "100%" }} />
                )}
              </div>
            ))}

            {modalInfo.key === "artist-coin" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, fontSize: 16, display: "block", marginBottom: 6 }}>
                  Enteractive Scope
                </label>
                <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid #555", padding: "8px 12px", borderRadius: 8 }}>
                  {enteractives.map((name) => (
                    <label key={name} style={{ display: "block", marginBottom: 4 }}>
                      <input
                        type="checkbox"
                        value={name}
                        checked={Array.isArray(formState.scope) ? formState.scope.includes(name) : false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormState((prev) => {
                            const current = Array.isArray(prev.scope) ? prev.scope : [];
                            return {
                              ...prev,
                              scope: checked ? [...current, name] : current.filter((x) => x !== name),
                            };
                          });
                        }}
                      />{" "}
                      {name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button type="submit" disabled={loading} style={{ background: "#2563eb", color: "#fff", padding: "12px", fontWeight: 700, flex: 1, borderRadius: 8, border: "none" }}>
                {loading ? "Processing..." : "Submit"}
              </button>
              <button type="button" onClick={() => setModalInfo(null)} style={{ background: "#444", color: "#fff", padding: "12px", fontWeight: 600, flex: 1, borderRadius: 8, border: "none" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showAuthModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#222", padding: 32, borderRadius: 12, minWidth: 320, maxWidth: "90vw" }}>
            <AuthPanel />
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ marginTop: 16, background: "#444", color: "#eee", padding: "10px 20px", borderRadius: 6, border: "none", fontWeight: "bold", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
