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

      {/* Overlayed Content Panels */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 2, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: "#39ff14" }}>Onboarding</div>
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

        <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 12 }}>
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

        {/* Placeholder for directions */}
        <div style={{ background: "#111", opacity: 0.9, padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#39ff14" }}>Step-by-Step Directions</div>
          <div style={{ fontSize: 13, color: "#ccc" }}>
            Follow directions here… (replace with dynamic content)
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, background: "rgba(0,0,0,0.6)", borderRadius: 12, padding: 16 }}>
          <WalletPanel />
          {/* You can also inject FAM awards, tickets, idea flight here */}
        </div>
      </div>

      {/* Map Background (70% height) */}
      {mapVisible && (
        <div style={{ height: "70vh", width: "100vw", position: "relative", zIndex: 1 }}>
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
    </div>
  );
}
