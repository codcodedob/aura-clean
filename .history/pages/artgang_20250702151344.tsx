// pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
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
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>({});

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      if (data?.user) {
        supabase.from("users").select("*").eq("id", data.user.id).single().then(({ data }) => {
          setUserData(data || {});
        });
      }
    });

    supabase.from("settings").select("value").eq("key", "videourl").single().then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));
    supabase.from("fam_awards").select("*").order("year", { ascending: false }).then(({ data }) => setFamAwards(data || []));
    supabase.from("tickets").select("*").then(({ data }) => setLiveTickets(data || []));
  }, []);

  const handleCheckpointClick = async (field: string) => {
    if (!user) return;
    const { error } = await supabase.from("users").update({ [field]: "sample value" }).eq("id", user.id);
    if (error) {
      console.error("Failed to update onboarding step:", error);
    } else {
      setUserData((prev: any) => ({ ...prev, [field]: "sample value" }));
    }
  };

  const arcFields = [
    "halo_id", "birthday", "age", "sex", "address",
    "parent_a_halo", "parent_z_halo", "username",
    "display_image", "status", "user_id", "shipping_address", "halo_range"
  ];

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
          background: "#000"
        }}
      />

      {/* Navigation Checkpoints */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#111', borderBottom: '1px solid #222', zIndex: 2 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '1rem', gap: '1.5rem' }}>
          {arcFields.map(field => (
            <button
              key={field}
              onClick={() => handleCheckpointClick(field)}
              style={{
                background: 'transparent',
                color: userData?.[field] ? '#0af' : '#ff4d4d',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                borderBottom: '2px solid #444',
                padding: '0.5rem 1rem',
              }}
            >
              {userData?.[field] ? `${field}: ${userData[field]}` : `${field} (❗)`}
            </button>
          ))}
          <button
            onClick={() => router.push("/artgang")}
            style={{
              marginLeft: '1rem',
              background: '#222',
              color: '#39ff14',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 1px 8px #39ff1450'
            }}
          >
            artgang→
          </button>
        </div>
      </div>

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

      <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 24, padding: "32px 24px", background: "rgba(19,32,24,0.85)", minHeight: "50vh" }}>
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
                <div key={t.id} style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160, cursor: "pointer" }} onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}>
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
