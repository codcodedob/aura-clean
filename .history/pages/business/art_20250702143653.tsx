// pages/business/art.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { BusinessOnboardingFlow, ArcSessionOnboardingFlow } from "@/components/OnboardFlow";

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });

const DEFAULT_VIDEO = "/bg/default-art.mp4"; // fallback

export default function ArtBusinessPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [userRole, setUserRole] = useState("business");
  const [profileStatus, setProfileStatus] = useState("onboarding");

  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "videourl").single()
      .then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));

    supabase.from("fam_awards").select("*").order("year", { ascending: false })
      .then(({ data }) => setFamAwards(data || []));

    supabase.from("live_tickets").select("*")
      .then(({ data }) => setLiveTickets(data || []));
  }, []);

  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      <video
        src={videoUrl || DEFAULT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.16,
          pointerEvents: "none",
          background: "#000",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "20px 12px" }}>
        {/* Onboarding Section */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {userRole === "business" && profileStatus === "onboarding" && (
              <div style={{ background: "#101010", padding: 12, borderRadius: 10 }}>
                <BusinessOnboardingFlow />
              </div>
            )}
            {userRole === "arc" && profileStatus === "onboarding" && (
              <div style={{ background: "#111", padding: 12, borderRadius: 10 }}>
                <ArcSessionOnboardingFlow />
              </div>
            )}
          </div>
        </div>

        {/* Google Map */}
        <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid #222", marginBottom: 30 }}>
          <div style={{ height: 300, width: "100%" }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", language: "en" }}
              defaultCenter={mapCenter}
              defaultZoom={11}
            >
              <div lat={mapCenter.lat} lng={mapCenter.lng}>
                <span style={{ background: "#39ff14", color: "#191c24", borderRadius: "50%", padding: 8, fontWeight: 700 }}>◎</span>
              </div>
            </GoogleMapReact>
          </div>
        </div>

        {/* Panels Section */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {/* Left Panel */}
          <div style={{ flex: "1 1 340px", minWidth: 340 }}>
            <WalletPanel />
            <div style={{ fontSize: 14, color: "#39ff1480", marginTop: 4 }}>
              Connect your agent wallet/API for payments, royalties, and digital assets.
            </div>
          </div>

          {/* Middle Panel */}
          <div style={{ flex: "1 1 420px", minWidth: 360 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: "#39ff14" }}>FAM Awards</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {famAwards.map((a) => (
                <div key={a.id} style={{ minWidth: 210, background: "#181f1b", borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 600, color: "#39ff14" }}>{a.title}</div>
                  <img src={a.img_url} alt={a.title} style={{ width: "100%", borderRadius: 10, margin: "10px 0" }} />
                  <div style={{ fontSize: 13, color: "#eee" }}>Winner: <b>{a.winner}</b></div>
                </div>
              ))}
            </div>

            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 30, color: "#39ff14" }}>Upcoming Events</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {liveTickets.map((t) => (
                <div
                  key={t.id}
                  style={{ minWidth: 200, background: "#191c24", borderRadius: 14, padding: 12, cursor: "pointer" }}
                  onClick={() => setShowQR((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                >
                  {showQR[t.id] ? (
                    <QRCode value={t.id} size={140} bgColor="#111" fgColor="#39ff14" />
                  ) : (
                    <>
                      <div style={{ fontWeight: 600 }}>{t.event}</div>
                      <div style={{ fontSize: 13, color: "#eee" }}>{t.date} · {t.venue}</div>
                      <div style={{ fontSize: 13, color: "#fecf2f", margin: "4px 0" }}>Seat: {t.seat}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ flex: "1 1 260px", minWidth: 240 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <button style={{ flex: 1, padding: "12px 0", background: "#1b2", color: "#fff", fontWeight: 700, borderRadius: 12, fontSize: 16 }}>Create IdeaFlight</button>
              <button style={{ flex: 1, padding: "12px 0", background: "#191c24", color: "#39ff14", border: "2px solid #39ff14", fontWeight: 700, borderRadius: 12, fontSize: 16 }}>Go to Space</button>
            </div>
            <div style={{ background: "#181f1b", borderRadius: 12, padding: 16, minHeight: 180 }}>
              <div style={{ color: "#39ff14", fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Ideaflight Panel</div>
              <p style={{ color: "#eaeaea", fontSize: 14 }}>
                Collaborate, launch, and organize projects with real-time tools. <br />
                (Coming soon: plug-in creative agents and live team sessions.)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
