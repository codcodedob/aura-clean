import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoRotator from "@/components/LogoRotator";
import { getOrCreateUserCoin } from "@/utils/getOrCreateUserCoin";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "burks.donte@gmail.com";

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
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [modalInfo, setModalInfo] = useState<BusinessOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({});
  const [enteractives, setEnteractives] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    supabase.from("enteractives").select("name").then(({ data }) => {
      if (data) setEnteractives(data.map((x) => x.name));
    });
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormState((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setFormState((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleOpenModal = (option: BusinessOption): void => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setModalInfo(option);
    setFormState({});
  };

  const handleSubmitModal = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
        const stripeModule = await import("@stripe/stripe-js");
        const stripe = await stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        await stripe?.redirectToCheckout({ sessionId: json.sessionId });
        setModalInfo(null);
      }
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }

    setLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setUser(data.user);
      setShowAuthModal(false);
      router.reload();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#eee", padding: 40 }}>
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
      <h1 style={{ fontSize: 36, fontWeight: 700, marginTop: 32 }}>
        Business Solutions
      </h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Pick the option that fits your vision. Fast onboarding, real payments.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {businessOptions.map((option) => (
          <div key={option.key} style={{ background: "#222", padding: 24, borderRadius: 12, width: 320 }}>
            <h2 style={{ fontSize: 22 }}>{option.name}</h2>
            <p style={{ fontWeight: "bold", fontSize: 20 }}>{option.price === 0 ? "$0" : `$${option.price}`}</p>
            <p>{option.description}</p>
            <ul>
              {option.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button
              onClick={() => handleOpenModal(option)}
              style={{
                marginTop: 16,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                padding: "12px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              {option.button}
            </button>
          </div>
        ))}
      </div>

      {/* Keep your original modal logic here */}
      {modalInfo && (
        <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          {/* Modal form JSX from your original version should go here */}
        </div>
      )}

      {showAuthModal && (
        <div style={{ position: "fixed", inset: 0, background: "#0009", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#222", padding: 32, borderRadius: 10, width: 320 }}>
            <h2 style={{ marginBottom: 16 }}>
              Please sign in with your <span style={{ color: "#0af" }}>ADOB ID</span> or create one to access this feature.
            </h2>
            <form onSubmit={handleAuthSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 6, border: "1px solid #444", background: "#111", color: "#fff" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #444", background: "#111", color: "#fff" }}
              />
              <button type="submit" style={{ width: "100%", padding: 10, background: "#0af", color: "#000", borderRadius: 6, fontWeight: 700 }}>
                Sign In
              </button>
              {authError && <p style={{ marginTop: 12, color: "#f66" }}>{authError}</p>}
            </form>
            <button onClick={() => setShowAuthModal(false)} style={{ marginTop: 20, color: "#ccc", background: "transparent", border: "none", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
