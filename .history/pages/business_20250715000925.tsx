import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoRotator from "@/components/LogoRotator";
import { getOrCreateUserCoin } from "@/utils/getOrCreateUserCoin";
import { useRouter } from "next/router";

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
      { name: "name", label: "Coin Name", type: "text", required: true },
      { name: "scope", label: "Scope", type: "text", required: true },
      { name: "dividend_eligible", label: "Eligible for Dividends", type: "checkbox" },
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
];

export default function Business() {
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [modalInfo, setModalInfo] = useState<BusinessOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<Record<string, any>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" && "checked" in target ? (target as HTMLInputElement).checked : value,
    }));
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
            name: formState.name,
            symbol: formState.name?.slice(0, 8)?.toUpperCase() || "COIN",
            scope: [formState.scope],
            dividend_eligible: !!formState.dividend_eligible,
            owner_name: user.email,
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

        router.push("/dobemosaic");
      } else {
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

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return (
      <div>
        <h2>Sign In Required</h2>
        <a href="/login">Go to Sign In</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Business Solutions</h1>
      {businessOptions.map((option) => (
        <div key={option.key}>
          <h2>{option.name}</h2>
          <button onClick={() => handleOpenModal(option)}>
            {option.button}
          </button>
        </div>
      ))}
      {modalInfo && (
        <form onSubmit={handleSubmitModal}>
          <h2>{modalInfo.name} – Details</h2>
          {modalInfo.formFields.map((field) => (
            <div key={field.name}>
              <label>
                {field.label}
                {field.required && "*"}
              </label>
              {field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={!!formState[field.name]}
                  onChange={handleFormChange}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formState[field.name] || ""}
                  required={field.required}
                  onChange={handleFormChange}
                />
              )}
            </div>
          ))}
          <button type="submit">Submit</button>
          <button type="button" onClick={() => setModalInfo(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
