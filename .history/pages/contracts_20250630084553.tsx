// pages/contracts.tsx

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const HERO_OPTIONS = [
  {
    key: "artist-coin",
    label: "Artist Hosting + Investment Coin",
    desc: "Create your own creator coin, launch products, earn dividends, and let investors support your career.",
    price: "No upfront cost, optional investment, revenue dividends optional",
    action: "Create Coin",
  },
  {
    key: "simple-site",
    label: "Simple Custom Website",
    desc: "Low cost site for products, music, or art. Stripe, digital goods, and branding included.",
    price: "$500–$1000, 0% revenue share",
    action: "Start Site",
  },
  {
    key: "custom-app",
    label: "Pro App + Revenue Sharing",
    desc: "Get a custom app, advanced features, branding, and 10% revenue share. Onboarding fee: $1000+",
    price: "$1000+ up front, 10% revenue share",
    action: "Get a Quote",
  },
];

const SCOPE_OPTIONS = [
  "Music Artist",
  "Multi-medium Artist",
  "Streamer",
  "Content/Public Figure",
  "Designer",
  "Inventor",
  "Producer (Film)",
  "Producer (Music)",
  "Writer (Film)",
  "Writer (Music)",
];

export default function Contracts() {
  // States for custom modal
  const [showCreate, setShowCreate] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [partySearch, setPartySearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customInterval, setCustomInterval] = useState("monthly");
  const [customLength, setCustomLength] = useState("12");
  const [contracts, setContracts] = useState<any[]>([]);
  const [scopeOptions, setScopeOptions] = useState<string[]>([]);
  const [showScope, setShowScope] = useState(false);

  // Load contracts (mock/demo)
  useEffect(() => {
    // TODO: fetch contracts for user from Supabase
    setContracts([
      {
        id: 1,
        name: "Sample Artist Hosting Contract",
        parties: ["user1@email.com", "user2@email.com"],
        interval: "monthly",
        amount: 100,
        status: "Active",
        start: "2024-01-01",
        end: "2025-01-01",
      },
    ]);
  }, []);

  // User search on custom modal
  const handleUserSearch = async (q: string) => {
    setPartySearch(q);
    if (q.length > 2) {
      const { data } = await supabase
        .from("users")
        .select("id, email, username")
        .ilike("email", `%${q}%`);
      setUserResults(data || []);
    } else {
      setUserResults([]);
    }
  };

  // Onboarding modal for hero cards (Artist Coin, etc)
  const [showOnboard, setShowOnboard] = useState<null | string>(null);
  const [onboardCoinName, setOnboardCoinName] = useState("");
  const [onboardScope, setOnboardScope] = useState<string[]>([]);
  const [onboardDividends, setOnboardDividends] = useState(false);

  // Demo: handle onboarding form submit
  const handleArtistCoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Insert coin to Supabase (add fields as needed)
    setShowOnboard(null);
    setOnboardCoinName("");
    setOnboardScope([]);
    setOnboardDividends(false);
    alert("Artist coin onboarding submitted (demo)");
  };

  // Custom contract creation logic
  const handleCustomCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !selectedUser || !customAmount || !customLength) return;
    // TODO: Insert contract to Supabase
    setShowCreate(false);
    setCustomTitle("");
    setSelectedUser(null);
    setCustomAmount("");
    setCustomLength("12");
    setCustomInterval("monthly");
    setPartySearch("");
    setUserResults([]);
    alert("Custom contract created (demo)");
  };

  // Pricing display for onboarding
  const priceLabel = (k: string) =>
    HERO_OPTIONS.find((o) => o.key === k)?.price || "";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Contracts & Onboarding</h1>

      {/* Onboarding Hero Cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 40,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {HERO_OPTIONS.map((opt) => (
          <div
            key={opt.key}
            style={{
              background: "#fafaff",
              border: "2px solid #0af2",
              borderRadius: 18,
              minWidth: 250,
              maxWidth: 320,
              boxShadow: "0 2px 16px #0af1",
              flex: "1 0 260px",
              padding: 32,
              marginBottom: 16,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
            onClick={() => {
              if (opt.key === "artist-coin") setShowOnboard("artist-coin");
              else if (opt.key === "custom-app") setShowOnboard("custom-app");
              else setShowOnboard("simple-site");
            }}
          >
            <h2 style={{ fontSize: 22, color: "#2563eb", marginBottom: 7 }}>
              {opt.label}
            </h2>
            <div style={{ color: "#111", marginBottom: 8 }}>{opt.desc}</div>
            <div style={{ color: "#0af", fontWeight: 700, fontSize: 17 }}>
              {opt.price}
            </div>
            <button
              style={{
                background: "#0af",
                color: "#fff",
                borderRadius: 9,
                padding: "9px 20px",
                marginTop: 16,
                fontWeight: 600,
                fontSize: 17,
                border: "none",
                boxShadow: "0 1px 4px #aaa3",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (opt.key === "artist-coin") setShowOnboard("artist-coin");
                else if (opt.key === "custom-app") setShowOnboard("custom-app");
                else setShowOnboard("simple-site");
              }}
            >
              {opt.action}
            </button>
            {opt.key === "artist-coin" && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "#0af1",
                  color: "#fff",
                  borderRadius: 4,
                  fontSize: 12,
                  padding: "3px 8px",
                }}
              >
                HIPSESSION latest art and creative launches
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Custom Contract button */}
      <button
        style={{
          background: "#fff",
          color: "#0af",
          border: "2px solid #0af",
          padding: "12px 28px",
          borderRadius: 9,
          fontWeight: 600,
          marginBottom: 34,
          fontSize: 18,
        }}
        onClick={() => setShowCreate(true)}
      >
        + Create Custom Contract
      </button>

      {/* List of user's contracts (demo data) */}
      <h3 style={{ marginTop: 26 }}>Your Contracts</h3>
      <table style={{ width: "100%", marginTop: 12, background: "#fafaff" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: 8 }}>Name</th>
            <th>Parties</th>
            <th>Interval</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 8 }}>{c.name}</td>
              <td>{c.parties.join(", ")}</td>
              <td>{c.interval}</td>
              <td>${c.amount}</td>
              <td>{c.status}</td>
              <td>
                {c.start} – {c.end}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Custom Contract Modal */}
      {showCreate && (
        <div
          style={{
            background: "#111c",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 18,
              minWidth: 370,
              maxWidth: 500,
            }}
            onSubmit={handleCustomCreate}
          >
            <h2>Create Custom Contract</h2>
            <label>
              Contract Name / Purpose
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                style={{ width: "100%", margin: "8px 0 12px" }}
              />
            </label>
            <label>
              Add Party (Search user email):
              <input
                type="text"
                value={partySearch}
                onChange={(e) => handleUserSearch(e.target.value)}
                style={{ width: "100%", margin: "8px 0" }}
              />
              <div style={{ maxHeight: 80, overflowY: "auto", marginBottom: 10 }}>
                {userResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    style={{
                      cursor: "pointer",
                      padding: 6,
                      background: selectedUser?.id === u.id ? "#0af2" : "#eee",
                      borderRadius: 4,
                      marginBottom: 3,
                    }}
                  >
                    {u.username ? `${u.username} - ` : ""}
                    {u.email}
                  </div>
                ))}
              </div>
              {selectedUser && (
                <div style={{ color: "#0af", marginBottom: 10 }}>
                  Selected: {selectedUser.email}
                </div>
              )}
            </label>
            <label>
              Contract Amount ($)
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                style={{ width: "100%", margin: "8px 0 12px" }}
              />
            </label>
            <label>
              Payment Interval
              <select
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                style={{ width: "100%", margin: "8px 0 12px" }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="daily">Daily</option>
              </select>
            </label>
            <label>
              Contract Length (# of {customInterval})
              <input
                type="number"
                value={customLength}
                onChange={(e) => setCustomLength(e.target.value)}
                style={{ width: "100%", margin: "8px 0 12px" }}
              />
            </label>
            <div style={{ margin: "10px 0", color: "#0af", fontWeight: 600 }}>
              {customAmount && customLength
                ? `Payment per interval: $${(
                    parseFloat(customAmount) / Math.max(1, parseInt(customLength))
                  ).toFixed(2)}`
                : ""}
            </div>
            <button
              style={{
                background: "#0af",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 700,
                border: "none",
                marginTop: 12,
              }}
              type="submit"
            >
              Submit
            </button>
            <button
              style={{
                background: "#eee",
                color: "#111",
                padding: "8px 16px",
                borderRadius: 6,
                fontWeight: 500,
                border: "none",
                marginLeft: 10,
              }}
              onClick={() => setShowCreate(false)}
              type="button"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Artist Coin Onboarding Modal */}
      {showOnboard === "artist-coin" && (
        <div
          style={{
            background: "#111c",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            style={{
              background: "#fff",
              padding: 36,
              borderRadius: 18,
              minWidth: 370,
              maxWidth: 530,
            }}
            onSubmit={handleArtistCoinSubmit}
          >
            <h2>Artist Coin Onboarding</h2>
            <label>
              Coin Name (your brand or artist name)
              <input
                value={onboardCoinName}
                onChange={(e) => setOnboardCoinName(e.target.value)}
                style={{ width: "100%", margin: "8px 0 12px" }}
                required
              />
            </label>
            <label>
              Describe your scope (select all that apply):
              <select
                multiple
                value={onboardScope}
                onChange={e => {
                  const opts = Array.from(e.target.selectedOptions).map((o: any) => o.value);
                  setOnboardScope(opts);
                }}
                style={{ width: "100%", margin: "8px 0 12px", minHeight: 90 }}
              >
                {SCOPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={onboardDividends}
                onChange={e => setOnboardDividends(e.target.checked)}
              />
              Dividends for investors?
            </label>
            <button
              type="submit"
              style={{
                background: "#0af",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                padding: "10px 20px",
                marginTop: 16,
                fontSize: 17,
                border: "none",
              }}
            >
              Submit
            </button>
            <button
              style={{
                background: "#eee",
                color: "#111",
                padding: "8px 16px",
                borderRadius: 6,
                fontWeight: 500,
                border: "none",
                marginLeft: 10,
              }}
              onClick={() => setShowOnboard(null)}
              type="button"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Simple Site modal */}
      {showOnboard === "simple-site" && (
        <div
          style={{
            background: "#111c",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 36,
              borderRadius: 18,
              minWidth: 370,
              maxWidth: 430,
            }}
          >
            <h2>Simple Site Onboarding</h2>
            <p>
              We’ll reach out to discuss your website, design, and requirements.
              Flat fee: $500–$1000. 0% revenue share. Stripe & digital sales included.
            </p>
            <button
              style={{
                background: "#0af",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                padding: "10px 20px",
                marginTop: 16,
                fontSize: 17,
                border: "none",
              }}
              onClick={() => {
                setShowOnboard(null);
                alert("Thank you! We’ll reach out for your custom site (demo).");
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Custom App modal */}
      {showOnboard === "custom-app" && (
        <div
          style={{
            background: "#111c",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 36,
              borderRadius: 18,
              minWidth: 370,
              maxWidth: 500,
            }}
          >
            <h2>Custom App Quote</h2>
            <p>
              Tell us about your app needs! Choose from popular features below, or request a call for complex solutions.
            </p>
            {/* Demo: Feature picker, can expand for real pricing */}
            <label>
              <input type="checkbox" />
              Audio/video streaming
            </label>
            <br />
            <label>
              <input type="checkbox" />
              NFT/digital product sales
            </label>
            <br />
            <label>
              <input type="checkbox" />
              Fan/creator messaging
            </label>
            <br />
            <label>
              <input type="checkbox" />
              Mobile-ready/responsive
            </label>
            <br />
            <label>
              <input type="checkbox" />
              Community chat/forum
            </label>
            <br />
            <label>
              <input type="checkbox" />
              Analytics dashboard
            </label>
            <br />
            <label>
              <input type="checkbox" />
              Investor dashboard/coins
            </label>
            <br />
            <label>
              <input type="checkbox" />
              Merchandise shop
            </label>
            <br />
            <br />
            <button
              style={{
                background: "#0af",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                padding: "10px 20px",
                fontSize: 17,
                border: "none",
              }}
              onClick={() => {
                setShowOnboard(null);
                alert(
                  "Thanks! We'll reach out with a quote and set up a consultation (demo)."
                );
              }}
            >
              Request a Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
