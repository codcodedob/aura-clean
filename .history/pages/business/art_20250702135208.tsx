// pages/business/art.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });

const DEFAULT_VIDEO = "/bg/default-art.mp4"; // fallback

export default function ArtBusinessPage() {
  // Supabase state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([
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
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});

  // Onboarding steps
  const onboardingSteps = [
    "Create Account",
    "Complete Profile",
    "Choose Art Role",
    "Upload Portfolio",
    "Set Up Wallet",
    "Get Verified",
    "Go Public (Artgang)",
  ];
  const [onboardIndex, setOnboardIndex] = useState(2);

  // Video BG: fetch from supabase.settings
  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "videourl")
      .single()
      .then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));
  }, []);

  // FAM Awards
  useEffect(() => {
    supabase
      .from("fam_awards")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => setFamAwards(data || []));
  }, []);

  // Google Maps Center
  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Video BG */}
      <video
        src={videoUrl || DEFAULT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          objectFit: "cover", zIndex: 0, opacity: 0.16, pointerEvents: "auto",
          background: "#000"
        }}
      />

      {/* Main Grid */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        padding: "38px 12px 48px 12px",
        background: "rgba(19,32,24,0.75)",
        minHeight: "100vh"
      }}>
        {/* Left: Onboarding + Map + Wallet */}
        <div style={{ flex: "1 1 340px", minWidth: 340, maxWidth: 480 }}>
          {/* Onboarding Timeline */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12, color: "#39ff14" }}>Onboarding</div>
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
              {onboardingSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div style={{
                    background: i < onboardIndex ? "#39ff14" : (i === onboardIndex ? "#fecf2f" : "#444"),
                    color: i < onboardIndex ? "#1a1a1a" : "#fff",
                    padding: "7px 17px",
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: 15,
                    minWidth: 100,
                    textAlign: "center",
                    marginRight: 4,
                  }}>
                    {step}
                  </div>
                  {i < onboardingSteps.length - 1 && (
                    <div style={{ width: 30, height: 3, background: i < onboardIndex ? "#39ff14" : "#333", borderRadius: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ textAlign: "right", marginTop: 14 }}>
              <button
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: "#222",
                  color: "#39ff14",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  marginLeft: 8,
                  boxShadow: "0 1px 8px #39ff1450"
                }}
              >
                Artgang: Go Public
              </button>
            </div>
          </div>
          {/* Google Map */}
          <div style={{
            marginBottom: 28, borderRadius: 20, overflow: "hidden", border: "2px solid #222"
          }}>
            <div style={{ height: 230, width: "100%" }}>
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
                  language: "en"
                }}
                defaultCenter={mapCenter}
                defaultZoom={11}
              >
                <div lat={mapCenter.lat} lng={mapCenter.lng}>
                  <span style={{
                    background: "#39ff14", color: "#191c24",
                    borderRadius: "50%", padding: 8, fontWeight: 700
                  }}>◎</span>
                </div>
              </GoogleMapReact>
            </div>
          </div>
          {/* Wallet Panel */}
          <div style={{ marginBottom: 30 }}>
            <WalletPanel />
            <div style={{ fontSize: 14, color: "#39ff1480", marginTop: 4 }}>
              Connect your agent wallet/API for payments, royalties, and digital assets.
            </div>
          </div>
        </div>

        {/* Middle: Fam Awards & Happenings */}
        <div style={{ flex: "1 1 420px", minWidth: 360 }}>
          {/* Fam Awards (Horizontal Scroll) */}
          <div style={{ marginBottom: 30 }}>
            <div style={{
              fontWeight: 700, fontSize: 22, marginBottom: 10, color: "#39ff14"
            }}>FAM Awards</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {(famAwards.length === 0 ? [{
                id: '0', title: 'Demo Award', img_url: '/awards/artist1.jpg',
                winner: 'Demo', video_url: '', description: 'Demo description', year: new Date().getFullYear()
              }] : famAwards).map(a => (
                <div key={a.id} style={{
                  minWidth: 210,
                  background: "#181f1b",
                  borderRadius: 14,
                  padding: 14,
                  boxShadow: "0 2px 16px #39ff1420"
                }}>
                  <div style={{ fontWeight: 600, color: "#39ff14" }}>{a.title}</div>
                  <img src={a.img_url} alt={a.title} style={{ width: "100%", borderRadius: 10, margin: "10px 0" }} />
                  <div style={{ fontSize: 13, color: "#eee" }}>
                    Winner: <b>{a.winner}</b>
                  </div>
                  {a.description && <div style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>{a.description}</div>}
                  {a.year && <div style={{ fontSize: 12, color: "#39ff1477", marginTop: 2 }}>Year: {a.year}</div>}
                  {a.video_url && (
                    <div style={{ marginTop: 8 }}>
                      <video src={a.video_url} controls width="100%" style={{ borderRadius: 8 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Happening Now & Upcoming Panel */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: "#39ff14" }}>
              Happening Now & Upcoming
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {liveTickets.map(t => (
                <div
                  key={t.id}
                  style={{
                    minWidth: 200, background: "#191c24", border: "1.5px solid #222",
                    borderRadius: 14, padding: 12, cursor: "pointer"
                  }}
                  onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                >
                  {showQR[t.id] ? (
                    <div>
                      <QRCode value={t.id} size={140} bgColor="#111" fgColor="#39ff14" />
                      <div style={{ color: "#ccc", marginTop: 6, fontSize: 13 }}>Tap for details</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.event}</div>
                      <div style={{ fontSize: 13, color: "#eee" }}>{t.date} · {t.venue}</div>
                      <div style={{ fontSize: 13, color: "#fecf2f", margin: "4px 0" }}>Seat: {t.seat}</div>
                      <div style={{ color: "#ccc", fontSize: 13 }}>Tap to show QR</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: IdeaFlight + Go to Space */}
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          {/* Two buttons side-by-side */}
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <button style={{
              flex: 1, padding: "12px 0", background: "#1b2", color: "#fff",
              fontWeight: 700, borderRadius: 12, border: "none", fontSize: 16,
              letterSpacing: 1, boxShadow: "0 1px 8px #39ff1433", cursor: "pointer"
            }}>
              Create IdeaFlight
            </button>
            <button style={{
              flex: 1, padding: "12px 0", background: "#191c24", color: "#39ff14",
              fontWeight: 700, borderRadius: 12, border: "2px solid #39ff14", fontSize: 16,
              letterSpacing: 1, boxShadow: "0 1px 8px #39ff1433", cursor: "pointer"
            }}>
              Go to Space
            </button>
          </div>
          {/* Ideaflight panel */}
          <div style={{
            background: "#181f1b", borderRadius: 12, padding: 16, minHeight: 180, boxShadow: "0 2px 16px #39ff1420"
          }}>
            <div style={{
              color: "#39ff14", fontWeight: 600, fontSize: 18, marginBottom: 6, letterSpacing: 1.2
            }}>Ideaflight Panel</div>
            <p style={{ color: "#eaeaea", fontSize: 14, marginBottom: 0 }}>
              Collaborate, launch, and organize projects with real-time tools. <br />
              (Coming soon: plug-in creative agents and live team sessions.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
