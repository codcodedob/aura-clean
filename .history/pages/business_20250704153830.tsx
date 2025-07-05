// pages/business.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

const OPTIONS = [
  {
    title: "Basic Account",
    description: "For single users",
    price: "$0",
    note: "Always free",
    features: [
      "Free statistics",
      "5 Research AI queries each month",
    ],
    details: [
      "Explore selected statistics, offering historic insights across industries",
      "Ask 5 queries with Research AI for instant, expert-backed insights"
    ],
    cta: "Register now",
    featured: false,
    onClick: (setOnboard: any) => setOnboard("basic"),
  },
  {
    title: "Starter Account",
    description: "For single users",
    price: "$199",
    note: "per month, billed annually",
    features: [
      "Free statistics",
      "Unlimited premium statistics",
      "Unlimited Research AI queries"
    ],
    details: [
      "Explore selected statistics, offering historic insights across industries",
      "Unlimited access to 1M+ current statistics with source references and exports",
      "Ask unlimited queries with Research AI for instant, expert-backed insights"
    ],
    cta: "Buy now",
    featured: true, // Blue badge
    onClick: (setOnboard: any) => setOnboard("starter"),
  },
  {
    title: "Personal Account",
    description: "For single users",
    price: "$599",
    note: "per month, billed annually",
    features: [
      "Free statistics",
      "Unlimited premium statistics",
      "Unlimited Research AI queries",
      "Reports"
    ],
    details: [
      "Explore selected statistics, offering historic insights across industries",
      "Unlimited access to 1M+ current statistics with source references and exports",
      "Ask unlimited queries with Research AI for instant, expert-backed insights",
      "Access expert analyst reports for in-depth insights and seamless exporting"
    ],
    cta: "Buy now",
    featured: false,
    onClick: (setOnboard: any) => setOnboard("personal"),
  },
  {
    title: "Professional Account",
    description: "For teams of up to 5 people",
    price: "$1,299",
    note: "per month, billed annually",
    features: [
      "Free statistics",
      "Unlimited premium statistics",
      "Unlimited Research AI queries",
      "Reports",
      "Market Insights"
    ],
    details: [
      "Explore selected statistics, offering historic insights across industries",
      "Unlimited access to 1M+ current statistics with source references and exports",
      "Ask unlimited queries with Research AI for instant, expert-backed insights",
      "Access expert analyst reports for in-depth insights and seamless exporting",
      "Forecast market trends with interactive tools and data for 1,000+ industries"
    ],
    cta: "Buy now",
    featured: false,
    onClick: (setOnboard: any) => setOnboard("professional"),
  },
];

export default function BusinessOptionsPage() {
  const [user, setUser] = useState<any>(null);
  const [onboard, setOnboard] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Modal flows and logic for each option go here (reuse your existing code...)

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f6f8fb",
      padding: 36
    }}>
      <h1 style={{
        fontSize: 38, fontWeight: 800, marginBottom: 22,
        color: "#1a2a3a", letterSpacing: -1
      }}>Choose Your Business Plan</h1>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 30,
        justifyContent: "center", alignItems: "flex-end"
      }}>
        {OPTIONS.map((opt, i) => (
          <div
            key={opt.title}
            style={{
              flex: "1 1 280px",
              maxWidth: 340,
              minWidth: 265,
              background: "#fff",
              border: opt.featured ? "2.5px solid #0a7aff" : "1.5px solid #e6eaf3",
              borderRadius: 20,
              boxShadow: opt.featured
                ? "0 8px 36px 0 #0a7aff33"
                : "0 2px 14px 0 #b0bfd82e",
              padding: "34px 26px 28px",
              marginTop: opt.featured ? -14 : 10,
              position: "relative",
              zIndex: opt.featured ? 2 : 1,
              transition: "box-shadow 0.2s"
            }}
          >
            {opt.featured && (
              <div style={{
                position: "absolute", top: -26, left: "50%",
                transform: "translateX(-50%)",
                background: "#0a7aff", color: "#fff",
                fontWeight: 700, fontSize: 17, borderRadius: 16,
                padding: "4px 22px", letterSpacing: 0.1,
                boxShadow: "0 4px 18px #0a7aff33"
              }}>
                Based on your interests
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontWeight: 700, color: "#222",
                fontSize: 18, marginBottom: 6
              }}>{opt.title}</div>
              <div style={{ color: "#6a7a9f", fontWeight: 500, fontSize: 16 }}>{opt.description}</div>
            </div>
            <div style={{
              fontSize: 42, fontWeight: 900,
              color: "#0a7aff", marginBottom: 4
            }}>{opt.price}</div>
            <div style={{
              color: "#54607c", fontSize: 15, marginBottom: 15
            }}>{opt.note}</div>
            <ul style={{
              listStyle: "none", padding: 0, margin: 0, marginBottom: 16
            }}>
              {opt.features.map((feat, idx) => (
                <li key={feat} style={{
                  marginBottom: 7,
                  color: "#1a2a3a", fontSize: 16,
                  fontWeight: 600,
                  display: "flex", alignItems: "center"
                }}>
                  <span style={{
                    color: "#22bb66",
                    fontSize: 19, marginRight: 8,
                    display: "inline-block"
                  }}>✔</span>
                  {feat}
                </li>
              ))}
            </ul>
            <button
              onClick={() => opt.onClick(setOnboard)}
              style={{
                width: "100%",
                margin: "14px 0 0",
                background: "#0a7aff",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 18,
                padding: "13px 0",
                boxShadow: "0 2px 16px #0a7aff26",
                cursor: "pointer",
                transition: "background 0.18s"
              }}>
              {opt.cta}
            </button>
            <div style={{
              marginTop: 14,
              color: "#488", fontSize: 15,
              minHeight: 45, opacity: 0.7
            }}>
              {opt.details.map((d, idx) => (
                <div key={idx} style={{ marginBottom: 3 }}>{d}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Place your onboarding modal logic/components below */}
      {onboard && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#10283c66", zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 14,
            boxShadow: "0 4px 32px #0a7aff22",
            padding: 32, minWidth: 350, maxWidth: "94vw"
          }}>
            {/* ...insert your current onboarding/modal forms here, based on 'onboard' value... */}
            <h3>{onboard} onboarding here</h3>
            <button style={{
              marginTop: 20, padding: "9px 20px", borderRadius: 8, background: "#0a7aff", color: "#fff", border: "none", fontWeight: 700
            }} onClick={() => setOnboard(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
