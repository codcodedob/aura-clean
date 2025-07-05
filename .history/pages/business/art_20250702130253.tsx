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
          objectFit: "cover", zIndex: 0, opacity: 0.16, pointerEvents: "none",
          background: "#000"
        }}
      />

      {/* Header and layout grid */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-4 left-6 text-2xl font-extrabold text-white drop-shadow-lg"
      >
        Art Department
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-5 right-5 bg-white text-black rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm bg-opacity-90 cursor-pointer hover:scale-105 transition"
      >
        Hi, I'm AURA. Tap me for live help.
      </motion.div>

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
        {/* Onboarding + Wallet + Map (left) */}
        <div style={{ flex: "1 1 340px", minWidth: 340, maxWidth: 480 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12, color: "#39ff14" }}>Onboarding</div>
          <div style={{ display: "flex", alignItems: "center", overflowX: "auto", marginBottom: 20 }}>
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

          <WalletPanel />

          <div style={{ marginTop: 12, marginBottom: 16 }}>
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

          <div style={{ marginTop: 24 }}>
            {mapVisible && (
            <div style={{ marginTop: 12 }}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" }}
                defaultCenter={mapCenter}
                defaultZoom={11}
                style={{ borderRadius: 20 }}
              >
                <div lat={mapCenter.lat} lng={mapCenter.lng}>
                  <span style={{ background: "#39ff14", color: "#191c24", borderRadius: "50%", padding: 8, fontWeight: 700 }}>◎</span>
                </div>
              </GoogleMapReact>
            </div>
          )}</div>
        </div>

        {/* FAM Awards + Live Tickets (middle) */}
        <div style={{ flex: "1 1 420px", minWidth: 360 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: "#39ff14" }}>FAM Awards</div>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {(famAwards.length === 0 ? [{
              id: '0', title: 'Demo Award', img_url: '/awards/artist1.jpg', winner: 'Demo', year: new Date().getFullYear()
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
                <div style={{ fontSize: 13, color: "#eee" }}>Winner: <b>{a.winner}</b></div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 22, marginTop: 24, marginBottom: 10, color: "#39ff14" }}>Happening Now</div>
          <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
            {liveTickets.map(t => (
              <div key={t.id} style={{
                minWidth: 200,
                background: "#191c24",
                border: "1.5px solid #222",
                borderRadius: 14,
                padding: 12,
                cursor: "pointer"
              }}>
                <div style={{ fontWeight: 600 }}>{t.event}</div>
                <div style={{ fontSize: 13, color: "#eee" }}>{t.date} · {t.venue}</div>
                <div style={{ fontSize: 13, color: "#fecf2f", margin: "4px 0" }}>Seat: {t.seat}</div>
              </div>
            ))}
          </div>
        </div>

        {/* IdeaFlight (right) */}
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <button style={{
              flex: 1,
              padding: "12px 0",
              background: "#1b2",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 12,
              border: "none",
              fontSize: 16,
              letterSpacing: 1,
              boxShadow: "0 1px 8px #39ff1433",
              cursor: "pointer"
            }}>
              Create IdeaFlight
            </button>
            <button style={{
              flex: 1,
              padding: "12px 0",
              background: "#191c24",
              color: "#39ff14",
              fontWeight: 700,
              borderRadius: 12,
              border: "2px solid #39ff14",
              fontSize: 16,
              letterSpacing: 1,
              boxShadow: "0 1px 8px #39ff1433",
              cursor: "pointer"
            }}>
              Go to Space
            </button>
          </div>
          <div style={{
            background: "#181f1b",
            borderRadius: 12,
            padding: 16,
            minHeight: 180,
            boxShadow: "0 2px 16px #39ff1420"
          }}>
            <div style={{
              color: "#39ff14",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 6,
              letterSpacing: 1.2
            }}>Ideaflight Panel</div>
            <p style={{ color: "#eaeaea", fontSize: 14, marginBottom: 0 }}>
              Collaborate, launch, and organize projects with real-time tools.<br />
              (Coming soon: plug-in creative agents and live team sessions.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
