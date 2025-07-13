// pages/business.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoRotator from "@/components/LogoRotator";
import { getOrCreateUserCoin } from "@/utils/getOrCreateUserCoin";

const ADMIN_EMAIL = "";

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
  const [user, setUser] = useState<null | undefined | { id: string; email: string }>(undefined);
  const [modalInfo, setModalInfo] = useState<BusinessOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const [formState, setFormState] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user;
      if (u) setUser({ id: u.id, email: u.email! });
      else setUser(null);
    });
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    if (type === "checkbox" && target instanceof HTMLInputElement) {
      setFormState((prev) => ({
        ...prev,
        [name]: target.checked,
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

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    setLoading(true);

    try {
      if (modalInfo?.key === "artist-coin") {
        const { data: coin, error } = await supabase
          .from("aura_coins")
          .insert({
            owner_name: user.email,
            coinName: formState.coinName as string,
            symbol:
              (formState.coinName as string)?.slice(0, 8)?.toUpperCase() || "COIN",
            scopes: [formState.coinScope as string],
            dividends_eligible: !!formState.coinDividends,
            projects: formState.coinProjects
              ? (formState.coinProjects as string)
                  .split(",")
                  .map((s) => s.trim())
              : [],
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
          const stripe = await (await import("@stripe/stripe-js")).loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
          );
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

  const addToCart = (key: string) => setCart((prev) => [...prev, key]);

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
    <div style={{ minHeight: "140vh", background: "#f7fafd", padding: "36px 0" }}>
      <LogoRotator
        images={[
          "/screenshots/Logo1.png",
          "/screenshots/Logo2.png",
          "/screenshots/Logo3.png",
          "/screenshots/Logo4.png",
          "/screenshots/Logo5.png",
          "/screenshots/Logo6.png",
          "/screenshots/Logo7.png",
          "/screenshots/Logo8.png",
        ]}
        size={88}
        interval={900}
      />
      {/* ... rest of your markup unchanged ... */}
    </div>
  );
}
