// pages/business/art.tsx

'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { motion } from 'framer-motion';
import { FaBusinessTime, FaWallet, FaList, FaMoneyBill, FaRocket, FaUserShield, FaHeartbeat, FaBrain, FaBalanceScale, FaClock } from 'react-icons/fa';

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });

const DEFAULT_VIDEO = "/bg/default-art.mp4"; // fallback

export default function ArtBusinessPage() {
  const [mapVisible, setMapVisible] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [onboardIndex, setOnboardIndex] = useState(2);

  const onboardingSteps = [
    "Create Account",
    "Complete Profile",
    "Choose Art Role",
    "Upload Portfolio",
    "Set Up Wallet",
    "Get Verified",
    "Go Public (Artgang)",
  ];

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
          objectFit: "cover", zIndex: 0, opacity: 0.16,
          background: "#000"
        }}
      />

      {/* Map Section */}
      {m<div style={{ height: "60vh", width: "100vw", position: "relative", zIndex: 1, pointerEvents: "none" }}>

          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" }}
            defaultCenter={mapCenter}
            defaultZoom={11}
          >
            <div lat={mapCenter.lat} lng={mapCenter.lng}>
              <span style={{ background: "#39ff14", color: "#191c24", borderRadius: "50%", padding: 8, fontWeight: 700 }}>◎</span>
            </div>
          </GoogleMapReact>
        </div>
      )}

      {/* Onboarding and Directions (30%) */}
      <div style={{ height: "30vh", width: "100%", zIndex: 2, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#39ff14" }}>Business Onboarding</div>
          <button
            onClick={() => setMapVisible((prev) => !prev)}
            style={{
              padding: "8px 16px",
              background: "#222",
              color: "#39ff14",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 0 6px #39ff1455"
            }}
          >
            {mapVisible ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
          {onboardingSteps.map((step, i) => (
            <div key={step} style={{
              background: i < onboardIndex ? "#39ff14" : (i === onboardIndex ? "#fecf2f" : "#444"),
              color: i < onboardIndex ? "#1a1a1a" : "#fff",
              padding: "6px 12px",
              borderRadius: 14,
              fontSize: 13,
              whiteSpace: "nowrap"
            }}>{step}</div>
          ))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#39ff14", marginBottom: 8 }}>Arc Session Onboarding</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
          {["Welcome", "Goals", "Lifestyle", "Health", "Clarity"].map((step, i) => (
            <div key={step} style={{
              background: "#333",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 14,
              fontSize: 13,
              whiteSpace: "nowrap"
            }}>{step}</div>
          ))}
        </div>
        <div style={{ background: "#111", opacity: 0.9, padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#39ff14" }}>Step-by-Step Directions</div>
          <div style={{ fontSize: 13, color: "#ccc" }}>
            Follow directions here… (replace with dynamic content)
          </div>
        </div>
      </div>

      {/* Component Content (30%) */}
      <div style={{ height: "30vh", width: "100%", zIndex: 2, padding: 24, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16 }}>
        {/* Left Panel - Times Table */}
        <div>
          <div style={{ background: "#222", borderRadius: 12, padding: 12, height: "100%" }}>
            <div style={{ fontWeight: 700, color: "#39ff14" }}>Times Table</div>
            <p style={{ fontSize: 13, color: "#ccc" }}>Time slots or custom calendar here</p>
          </div>
        </div>

        {/* Middle Panel - Awards + Tickets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#181f1b", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>FAM Awards</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {(famAwards.length === 0 ? [{ id: 'demo', title: 'Demo Award', img_url: '/awards/artist1.jpg', winner: 'Demo' }] : famAwards).map((a) => (
                <div key={a.id} style={{ background: "#101314", borderRadius: 10, padding: 10, minWidth: 160 }}>
                  <img src={a.img_url} alt={a.title} style={{ width: "100%", borderRadius: 6 }} />
                  <div style={{ fontSize: 13, marginTop: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>Winner: {a.winner}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#181f1b", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>Live Tickets</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {liveTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                  style={{ background: "#101314", borderRadius: 10, padding: 10, minWidth: 160, cursor: "pointer" }}
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

        {/* Right Panel - IdeaFlight */}
        <div>
          <div style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>IdeaFlight</div>
            <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>
              Collaborate, launch, and organize creative projects in real-time.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10, border: "none", fontSize: 14 }}>Create</button>
              <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700, fontSize: 14 }}>Go to Space</button>
            </div>
          </div>
        </div>
      </div>

      {/* WalletPanel at the bottom */}
      <div style={{ padding: 24, background: "#111" }}>
        <WalletPanel />
      </div>
    </div>
  );
}
