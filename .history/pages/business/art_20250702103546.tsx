// pages/business/art.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import WalletPanel from "@/components/WalletPanel";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { QRCodeSVG as QRCode } from "qrcode.react";

// Google Maps (dynamic to avoid SSR issues)
const GoogleMapReact = dynamic(() => import("google-map-react"), { ssr: false });

// -- Demo fallback video if none set in supabase settings
const DEFAULT_VIDEO_URL = "/video/demo-art-bg.mp4";

type FamAward = {
  id: string;
  title: string;
  media_img_url?: string;
  media_video_url?: string;
  winner: string;
  description?: string;
  year: string;
};

type LiveTicket = {
  id: string;
  event: string;
  date: string;
  venue: string;
  seat: string;
};

const onboardingSteps = [
  "Create Account",
  "Complete Profile",
  "Choose Art Role",
  "Upload Portfolio",
  "Set Up Wallet",
  "Get Verified",
  "Go Public (Artgang)",
];

const liveTicketsDemo: LiveTicket[] = [
  {
    id: "evt1",
    event: "Future Fest 2025",
    date: "2025-08-21",
    venue: "Metro Arena",
    seat: "GA",
  },
  {
    id: "evt2",
    event: "Dobe Launch",
    date: "2025-09-10",
    venue: "AI Gallery",
    seat: "B12",
  },
];

const MAP_CENTER = { lat: 40.7128, lng: -74.006 }; // Example: NYC
const MAP_MARKERS = [
  { lat: 40.713, lng: -74.006, label: "Delivery (You)" },
  // Extend with real data!
];

export default function ArtDepartment() {
  // Video BG (settings table key = 'videourl')
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);

  // Fam Awards from Supabase
  const [famAwards, setFamAwards] = useState<FamAward[]>([]);
  const [awardsLoading, setAwardsLoading] = useState(true);

  // Onboarding
  const [onboardIndex, setOnboardIndex] = useState(2); // Example: Step 3 of onboarding

  // Tickets QR
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});

  // Fetch video background
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "videourl")
        .single();
      if (data?.value) setVideoUrl(data.value);
    })();
  }, []);

  // Fetch Fam Awards
  useEffect(() => {
    setAwardsLoading(true);
    supabase
      .from("fam_awards")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => {
        setFamAwards(data || []);
        setAwardsLoading(false);
      });
  }, []);

  // Matrix green accent color
  const accent = "#19ff6a";

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        background: "#151e17",
      }}
    >
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        src={videoUrl}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.33,
          pointerEvents: "none",
          filter: "brightness(0.95) contrast(1.2)",
        }}
      />
      {/* FOREGROUND */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: 24,
          maxWidth: 1800,
          margin: "0 auto",
        }}
      >
        {/* --- Top row: Onboarding + Map + IdeaFlight --- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            marginBottom: 32,
          }}
        >
          {/* Onboarding */}
          <div style={{ flex: "1 1 330px", minWidth: 280 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
              Onboarding
            </div>
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
              {onboardingSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div
                    style={{
                      background:
                        i < onboardIndex
                          ? accent
                          : i === onboardIndex
                          ? "#fecf2f"
                          : "#232c24",
                      color: i < onboardIndex ? "#111" : "#fff",
                      padding: "7px 17px",
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 15,
                      minWidth: 90,
                      textAlign: "center",
                      marginRight: 4,
                    }}
                  >
                    {step}
                  </div>
                  {i < onboardingSteps.length - 1 && (
                    <div
                      style={{
                        width: 30,
                        height: 3,
                        background: i < onboardIndex ? accent : "#333",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ textAlign: "right", marginTop: 14 }}>
              <button
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: accent,
                  color: "#111",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  marginLeft: 8,
                  boxShadow: `0 1px 16px ${accent}33`,
                }}
                onClick={() => window.open("/business", "_self")}
              >
                Business Options
              </button>
            </div>
          </div>
          {/* Google Map */}
          <div style={{ flex: "1 1 380px", minWidth: 300, height: 270, borderRadius: 16, overflow: "hidden", boxShadow: `0 2px 16px ${accent}16` }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! }}
              defaultCenter={MAP_CENTER}
              defaultZoom={13}
              yesIWantToUseGoogleMapApiInternals
            >
              {MAP_MARKERS.map((m, idx) => (
                <div
                  key={idx}
                  lat={m.lat}
                  lng={m.lng}
                  style={{
                    color: accent,
                    background: "#1b1f17cc",
                    padding: "6px 14px",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    boxShadow: `0 0 10px ${accent}`,
                  }}
                >
                  {m.label}
                </div>
              ))}
            </GoogleMapReact>
          </div>
          {/* IdeaFlight panel with buttons */}
          <div style={{ flex: "1 1 340px", minWidth: 260 }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
              <button
                style={{
                  flex: 1,
                  background: accent,
                  color: "#151e17",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 8,
                  padding: "11px 0",
                  fontSize: 16,
                  boxShadow: `0 0 14px ${accent}55`,
                  cursor: "pointer",
                }}
                onClick={() => window.open("/space", "_self")}
              >
                Go To Space
              </button>
              <button
                style={{
                  flex: 1,
                  background: "#242c1a",
                  color: accent,
                  fontWeight: 700,
                  border: `1.5px solid ${accent}`,
                  borderRadius: 8,
                  padding: "11px 0",
                  fontSize: 16,
                  boxShadow: `0 0 8px ${accent}25`,
                  cursor: "pointer",
                }}
                onClick={() => window.open("/ideaflight", "_self")}
              >
                Create Idea Flight
              </button>
            </div>
            <div
              style={{
                background: "#161e15b3",
                borderRadius: 16,
                padding: 18,
                fontSize: 17,
                fontWeight: 600,
                color: accent,
                textAlign: "center",
                boxShadow: `0 0 24px ${accent}09`,
              }}
            >
              ✈️ <b>IdeaFlight:</b> Collaborate, launch, and share your next project here.
            </div>
          </div>
        </div>
        {/* --- Row: Wallet --- */}
        <div style={{ maxWidth: 500, marginBottom: 40 }}>
          <WalletPanel />
        </div>
        {/* --- Row: Fam Awards, Happening Now --- */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          {/* Fam Awards */}
          <div style={{ flex: "2 1 400px", minWidth: 340 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: accent }}>
              FAM Awards
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {awardsLoading && (
                <div style={{ color: "#aaa", fontStyle: "italic" }}>Loading awards...</div>
              )}
              {!awardsLoading &&
                famAwards.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      minWidth: 250,
                      background: "#222c22e8",
                      borderRadius: 14,
                      padding: 14,
                      boxShadow: `0 2px 16px ${accent}16`,
                      marginRight: 6,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{a.title}</div>
                    {a.media_img_url && (
                      <img
                        src={a.media_img_url}
                        alt={a.title}
                        style={{ width: "100%", borderRadius: 10, margin: "8px 0" }}
                      />
                    )}
                    {a.media_video_url && (
                      <video
                        src={a.media_video_url}
                        controls
                        style={{ width: "100%", borderRadius: 10, margin: "8px 0" }}
                      />
                    )}
                    <div style={{ fontSize: 13, color: "#fefc" }}>
                      Winner: <b>{a.winner}</b>
                    </div>
                    <div style={{ fontSize: 13, color: "#cfd", marginBottom: 2 }}>
                      {a.year}
                    </div>
                    <div style={{ fontSize: 13, color: "#cff", marginBottom: 2 }}>
                      {a.description}
                    </div>
                  </div>
                ))}
              {!awardsLoading && famAwards.length === 0 && (
                <div>No awards found.</div>
              )}
            </div>
          </div>
          {/* Happening Now & Upcoming */}
          <div style={{ flex: "1 1 260px", minWidth: 240 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: accent }}>
              Happening Now & Upcoming
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {liveTicketsDemo.map((t) => (
                <div
                  key={t.id}
                  style={{
                    minWidth: 200,
                    background: "#191c24",
                    border: `1px solid ${accent}`,
                    borderRadius: 14,
                    padding: 12,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setShowQR((prev) => ({
                      ...prev,
                      [t.id]: !prev[t.id],
                    }))
                  }
                >
                  {showQR[t.id] ? (
                    <div>
                      <QRCode value={t.id} size={140} />
                      <div style={{ color: "#ccc", marginTop: 6, fontSize: 13 }}>
                        Tap for details
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.event}</div>
                      <div style={{ fontSize: 13, color: "#eee" }}>
                        {t.date} · {t.venue}
                      </div>
                      <div style={{ fontSize: 13, color: "#fecf2f", margin: "4px 0" }}>
                        Seat: {t.seat}
                      </div>
                      <div style={{ color: "#ccc", fontSize: 13 }}>Tap to show QR</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
