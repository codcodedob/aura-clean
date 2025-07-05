// pages/business/art.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });

const DEFAULT_VIDEO = "/bg/default-art.mp4";

export default function ArtBusinessPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});

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

  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "videourl")
      .single()
      .then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));

    supabase
      .from("fam_awards")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => setFamAwards(data || []));

    supabase
      .from("tickets")
      .select("*")
      .then(({ data }) => setLiveTickets(data || []));
  }, []);

  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      $1

      {/* Onboarding Section */}
      <div style={{ 
        zIndex: 2, 
        background: "rgba(0,0,0,0.6)", 
        padding: "16px 24px", 
        display: "flex", 
        flexDirection: "column", 
        gap: 12 
      }}>
        {/* Business Onboarding */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {onboardingSteps.map((step, i) => (
            <div key={step} style={{
              background: i < onboardIndex ? "#39ff14" : i === onboardIndex ? "#fecf2f" : "#333",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 16,
              fontSize: 13,
              whiteSpace: "nowrap",
              fontWeight: 600
            }}>
              {step}
            </div>
          ))}
        </div>

        {/* ArcSession Onboarding */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {["Welcome", "Mindset", "Goals", "Health", "Harmony"].map((step, i) => (
            <div key={step} style={{
              background: "#444",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 16,
              fontSize: 13,
              whiteSpace: "nowrap",
              fontWeight: 500
            }}>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Map Full Width */}
      <div style={{ height: "50vh", width: "100vw", zIndex: 1 }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" }}
          defaultCenter={mapCenter}
          defaultZoom={11}
        >
          <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)' }}>
            <span style={{ background: "#39ff14", color: "#191c24", borderRadius: "50%", padding: 8, fontWeight: 700 }}>◎</span>
          </div>
        </GoogleMapReact>
      </div>

      {/* Content Grid */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        gap: 24,
        padding: "32px 24px",
        background: "rgba(19,32,24,0.85)",
        minHeight: "50vh"
      }}>
        {/* Left - Times Table */}
        <div>
          <div style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>Times Table</div>
            <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>View and manage availability</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10, border: "none", fontSize: 14 }} onClick={() => alert('Make Time clicked')}>Make Time</button>
              <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700, fontSize: 14 }} onClick={() => alert('Sync clicked')}>Sync</button>
            </div>
          </div>
        </div>

        {/* Center - Awards & Tickets */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 8 }}>FAM Awards</div>
            <div style={{ display: "flex", overflowX: "auto", gap: 12 }}>
              {(famAwards.length === 0 ? [{ id: 'demo', title: 'Demo Award', img_url: '/awards/artist1.jpg', winner: 'Demo' }] : famAwards).map(a => (
                <div key={a.id} style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160 }}>
                  <img src={a.img_url} style={{ width: "100%", borderRadius: 6 }} />
                  <div style={{ fontSize: 13, color: "#eee", marginTop: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>Winner: {a.winner}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 8 }}>Live Tickets</div>
            <div style={{ display: "flex", overflowX: "auto", gap: 12 }}>
              {liveTickets.map(t => (
                <div
                  key={t.id}
                  style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160, cursor: "pointer" }}
                  onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                >
                  {showQR[t.id] ? (
                    <>
                      <QRCode value={t.id} size={100} bgColor="#000" fgColor="#39ff14" />
                      <div style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>Tap to hide QR</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.event}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{t.date} · {t.venue}</div>
                      <div style={{ fontSize: 11, color: "#fecf2f" }}>Seat: {t.seat}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - IdeaFlight */}
        <div>
          <div style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>IdeaFlight</div>
            <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>Plan and launch new initiatives</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10, border: "none", fontSize: 14 }} onClick={() => alert('Create IdeaFlight clicked')}>Create</button>
              <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700, fontSize: 14 }} onClick={() => alert('Go to Space clicked')}>Go to Space</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, background: "#111" }}>
        <WalletPanel />
      </div>
    </div>
  );
}
