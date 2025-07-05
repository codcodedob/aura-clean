// pages/business/art.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

// Google Maps dynamic import
const GoogleMapReact = dynamic(() => import("google-map-react"), { ssr: false });

const onboardingSteps = [
  "Create Account",
  "Complete Profile",
  "Choose Art Role",
  "Upload Portfolio",
  "Set Up Wallet",
  "Get Verified",
  "Go Public (Artgang)",
];

export default function ArtDepartment() {
  // State for onboarding, QR toggles, tickets, famAwards, and settings
  const [onboardIndex, setOnboardIndex] = useState(2);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Settings load (video bg)
  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "videourl")
      .single()
      .then((res) => {
        if (res.data && res.data.value) setVideoUrl(res.data.value);
      });
  }, []);

  // Load Fam Awards from Supabase
  useEffect(() => {
    supabase
      .from("fam_awards")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => setFamAwards(data || []));
  }, []);

  // Demo tickets - replace with live query if you use Supabase for these
  useEffect(() => {
    setLiveTickets([
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
    ]);
  }, []);

  // Map coordinates (replace with your AGX/worker data)
  const mapCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco demo

  return (
    <div
      style={{
        padding: 0,
        background: "transparent",
        minHeight: "100vh",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Video BG */}
      {videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -2,
            filter: "brightness(0.56) saturate(1.3)",
            pointerEvents: "none",
          }}
          src={videoUrl}
        />
      )}

      {/* Matrix Green BG Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(110deg, #052b19cc 0%, #063f26cc 100%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* Main Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          padding: 24,
          justifyContent: "space-between",
        }}
      >
        {/* Left: Onboarding + Map + Wallet */}
        <div style={{ flex: "1 1 350px", minWidth: 330, maxWidth: 420 }}>
          {/* Onboarding Timeline */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 12,
                letterSpacing: 1,
              }}
            >
              Onboarding
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                overflowX: "auto",
              }}
            >
              {onboardingSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div
                    style={{
                      background:
                        i < onboardIndex
                          ? "#17fa79"
                          : i === onboardIndex
                          ? "#fecf2f"
                          : "#184b2a",
                      color: i < onboardIndex ? "#fff" : "#111",
                      padding: "7px 17px",
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 15,
                      minWidth: 100,
                      textAlign: "center",
                      marginRight: 4,
                    }}
                  >
                    {step}
                  </div>
                  {i < onboardingSteps.length - 1 && (
                    <div
                      style={{
                        width: 28,
                        height: 3,
                        background: i < onboardIndex ? "#17fa79" : "#333",
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
                  background: "#17fa79",
                  color: "#001f13",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  marginLeft: 8,
                  letterSpacing: 1,
                }}
                onClick={() => window.open("/business", "_self")}
              >
                Business Options
              </button>
            </div>
          </div>

          {/* AGX License/Artgang Panel */}
          <div style={{ marginBottom: 24 }}>
            <button
              style={{
                padding: "10px 22px",
                borderRadius: 8,
                background: "#00ffb2",
                color: "#113928",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                marginRight: 14,
                letterSpacing: 1,
              }}
              onClick={() => window.open("/agx-license", "_self")}
            >
              Artgang
            </button>
          </div>

          {/* Google Map */}
          <div
            style={{
              height: 260,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 18px #00ffb218",
              marginBottom: 28,
            }}
          >
            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
              }}
              center={mapCenter}
              defaultZoom={12}
              yesIWantToUseGoogleMapApiInternals
              options={{
                styles: [
                  {
                    featureType: "all",
                    elementType: "geometry.fill",
                    stylers: [{ color: "#0a3022" }],
                  },
                  {
                    featureType: "all",
                    elementType: "labels.text.stroke",
                    stylers: [{ color: "#001b10" }],
                  },
                ],
              }}
            />
          </div>

          {/* Wallet Panel */}
          <div style={{ marginBottom: 32 }}>
            <WalletPanel />
            <div
              style={{
                fontSize: 14,
                color: "#17fa799a",
                marginTop: 4,
              }}
            >
              Connect your agent wallet/API for payments, royalties, and digital assets.
            </div>
          </div>
        </div>

        {/* Middle: Fam Awards & Live Events */}
        <div style={{ flex: "1 1 420px", minWidth: 340 }}>
          {/* Fam Awards (Horizontal Scroll) */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 10,
                letterSpacing: 1,
              }}
            >
              FAM Awards
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {famAwards.map((a) => (
                <div
                  key={a.id}
                  style={{
                    minWidth: 210,
                    background: "#192f24e9",
                    borderRadius: 14,
                    padding: 12,
                    boxShadow: "0 2px 16px #17fa7918",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 17 }}>
                    {a.award_name || a.title}
                  </div>
                  {a.img_url && (
                    <img
                      src={a.img_url}
                      alt={a.award_name}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        margin: "10px 0",
                        minHeight: 100,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {a.video_url && (
                    <video
                      src={a.video_url}
                      style={{ width: "100%", marginBottom: 10, borderRadius: 8 }}
                      controls
                      muted
                    />
                  )}
                  <div style={{ fontSize: 13, color: "#fefc" }}>
                    Winner: <b>{a.winner}</b>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 5,
                      color: "#16c06f",
                    }}
                  >
                    {a.year} {a.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Happening Now & Upcoming Panel */}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 10,
                letterSpacing: 1,
              }}
            >
              Happening Now & Upcoming
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {liveTickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    minWidth: 200,
                    background: "#191c24dd",
                    border: "1px solid #222",
                    borderRadius: 14,
                    padding: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => setShowQR((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                >
                  {showQR[t.id] ? (
                    <div>
                      <QRCode value={t.id} size={140} />
                      <div style={{ color: "#ccc", marginTop: 6, fontSize: 13 }}>Tap for details</div>
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

        {/* Right: IdeaFlight */}
        <div
          style={{
            flex: "1 1 260px",
            minWidth: 240,
            maxWidth: 330,
            position: "relative",
          }}
        >
          <div style={{ marginBottom: 18, display: "flex", gap: 8 }}>
            <button
              style={{
                flex: 1,
                padding: "14px 10px",
                borderRadius: 9,
                background: "#17fa79",
                color: "#0a2212",
                fontWeight: 800,
                fontSize: 17,
                border: "none",
                letterSpacing: 1,
                boxShadow: "0 1px 6px #18f54236",
                cursor: "pointer",
              }}
              onClick={() => window.open("/space", "_self")}
            >
              Go to Space
            </button>
            <button
              style={{
                flex: 1,
                padding: "14px 10px",
                borderRadius: 9,
                background: "#011a15",
                color: "#17fa79",
                fontWeight: 800,
                fontSize: 17,
                border: "1px solid #17fa79",
                letterSpacing: 1,
                boxShadow: "0 1px 6px #17fa7924",
                cursor: "pointer",
              }}
              onClick={() => alert("Coming soon: Create IdeaFlight")}
            >
              Create IdeaFlight
            </button>
          </div>
          <div
            style={{
              background: "#0e211aee",
              borderRadius: 12,
              padding: 16,
              minHeight: 220,
              fontWeight: 600,
              textAlign: "center",
              fontSize: 18,
              boxShadow: "0 2px 12px #18f54218",
              marginBottom: 18,
              marginTop: 10,
            }}
          >
            <span>IdeaFlight: Share your wildest ideas or creative projects—connect, get feedback, launch with a crew.</span>
          </div>
          <div
            style={{
              background: "#222",
              borderRadius: 10,
              padding: 12,
              fontSize: 15,
              color: "#17fa79",
              textAlign: "center",
              cursor: "pointer",
              marginTop: 16,
              fontWeight: 700,
            }}
            onClick={() => window.open("/space", "_self")}
          >
            Go to My Space
          </div>
        </div>
      </div>
    </div>
  );
}
