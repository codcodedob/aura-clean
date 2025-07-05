import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import MotionSection from "@/components/MotionSection";
import MotionCard from "@/components/MotionCard";

// Dynamic import for the map (works with next/dynamic)
const GoogleMapReact = dynamic(() => import("google-map-react"), { ssr: false });

const onboardingSteps = [
  "Create Account",
  "Complete Profile",
  "Choose Art Role",
  "Upload Portfolio",
  "Set Up Wallet",
  "Get Verified",
  "Go Public (Artgang)"
];

// Demo: these would come from Supabase
function useFamAwards() {
  const [awards, setAwards] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("fam_awards")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => setAwards(data || []));
  }, []);
  return awards;
}

function useLiveEvents() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("live_events")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data }) => setEvents(data || []));
  }, []);
  return events;
}

export default function ArtgangPanel() {
  const [onboardIndex, setOnboardIndex] = useState(2);
  const [showMap, setShowMap] = useState(true);
  const [showMiddle, setShowMiddle] = useState(true);
  const [directions, setDirections] = useState("Complete the step above to continue onboarding.");
  const router = useRouter();
  const famAwards = useFamAwards();
  const liveEvents = useLiveEvents();

  // For magnetic effect
  const onboardPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onboardPanelRef.current) return;
    const panel = onboardPanelRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      const cards = Array.from(panel.querySelectorAll(".motion-card"));
      cards.forEach((el: any) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxMove = 28;
        if (dist < 200) {
          el.style.transform = `translate(${(dx / dist) * maxMove}px, ${(dy / dist) * maxMove}px) scale(1.04)`;
          el.style.boxShadow = `0 6px 32px #18ffb9a1`;
        } else {
          el.style.transform = "";
          el.style.boxShadow = "";
        }
      });
    };
    panel.addEventListener("mousemove", handleMouseMove);
    panel.addEventListener("mouseleave", () => {
      const cards = Array.from(panel.querySelectorAll(".motion-card"));
      cards.forEach((el: any) => {
        el.style.transform = "";
        el.style.boxShadow = "";
      });
    });
    return () => {
      panel.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Onboarding directions per step
  const stepDirections = [
    "Start by creating your account.",
    "Complete your personal and artist profile.",
    "Select your role in the art community.",
    "Upload your portfolio (music, art, etc).",
    "Set up your wallet for payments and royalties.",
    "Get verified to access full features.",
    "Go Public! Launch your creator profile and start building."
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#10131e" }}>
      {/* Video Background */}
      <video
        src="/your-art-bg-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          zIndex: 0,
          inset: 0,
          objectFit: "cover",
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          filter: "brightness(0.78) saturate(1.2)"
        }}
      />

      {/* Map (full-viewport, modular) */}
      {showMap && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "56vh",
            zIndex: 1,
            background: "#10131e"
          }}
        >
          <GoogleMapReact
            bootstrapURLKeys={{ key: "YOUR_GOOGLE_MAPS_API_KEY" }}
            defaultCenter={{ lat: 40.7128, lng: -74.006 }}
            defaultZoom={12}
          />
          {/* Directions overlay */}
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: 20,
              background: "#121b24ee",
              padding: "14px 28px",
              borderRadius: 14,
              fontWeight: 500,
              fontSize: 17,
              color: "#80ffd3",
              maxWidth: 480
            }}
          >
            {stepDirections[onboardIndex] || directions}
          </div>
        </div>
      )}

      {/* Layout */}
      <div
        style={{
          position: "absolute",
          top: showMap ? "58vh" : 0,
          left: 0,
          width: "100vw",
          height: showMap ? "42vh" : "100vh",
          display: "flex",
          zIndex: 2,
          transition: "top 0.35s cubic-bezier(.8,0,.17,1)"
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ flex: 1.1, padding: 24, minWidth: 320 }}>
          {/* Times TableView (Demo, replace with actual) */}
          <MotionSection>
            <MotionCard title="Today's Timetable">
              {/* Times Table Collection */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>9:00 AM - 12:00 PM: Gallery Tours</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>1:00 PM - 3:00 PM: Workshops</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>4:00 PM - 6:00 PM: Live Performances</div>
              </div>
            </MotionCard>
          </MotionSection>
          <WalletPanel />
        </div>

        {/* MIDDLE PANEL: Onboarding + Artgang + Map controls */}
        {showMiddle && (
          <div style={{ flex: 1.6, padding: 24, minWidth: 420, position: "relative" }}>
            {/* Onboarding Panel */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 27, fontWeight: 700, letterSpacing: 0.2 }}>Onboarding Flow</h2>
              <button
                onClick={() => router.push("/business/artgang")}
                style={{
                  background: "linear-gradient(90deg,#00ffa7,#18ffb9 90%)",
                  color: "#121b24",
                  fontWeight: 800,
                  fontSize: 16,
                  padding: "10px 28px",
                  borderRadius: 9,
                  border: "none",
                  boxShadow: "0 2px 16px #18ffb7c2",
                  cursor: "pointer"
                }}
              >
                Artgang Panel
              </button>
            </div>
            <div ref={onboardPanelRef} style={{ marginTop: 20, marginBottom: 12, display: "flex", gap: 18 }}>
              {onboardingSteps.map((step, i) => (
                <MotionCard
                  key={i}
                  title={step}
                  style={{
                    background: i === onboardIndex ? "#18ffb926" : "#151d22",
                    color: i === onboardIndex ? "#121b24" : "#fff",
                    border: i === onboardIndex ? "2.5px solid #18ffb9" : "1px solid #242c32"
                  }}
                  onClick={() => setOnboardIndex(i)}
                />
              ))}
            </div>
            {/* Step directions (if not using the map) */}
            {!showMap && (
              <div
                style={{
                  marginTop: 12,
                  fontWeight: 600,
                  color: "#18ffb9",
                  background: "#181c20f6",
                  borderRadius: 8,
                  padding: "13px 22px"
                }}
              >
                {stepDirections[onboardIndex]}
              </div>
            )}
            {/* Show/Hide Map Controls */}
            <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
              <button onClick={() => setShowMap(v => !v)} style={{ padding: "9px 17px", borderRadius: 8 }}>
                {showMap ? "Hide Map" : "Show Map"}
              </button>
              <button onClick={() => setShowMiddle(v => !v)} style={{ padding: "9px 17px", borderRadius: 8 }}>
                {showMiddle ? "Hide Middle Panel" : "Show Middle Panel"}
              </button>
            </div>
          </div>
        )}

        {/* RIGHT PANEL: Ideaflight */}
        <div style={{ flex: 1.1, padding: 24, minWidth: 320 }}>
          {/* Go To Space & Create Ideaflight buttons (side by side) */}
          <div style={{ display: "flex", gap: 15, marginBottom: 16 }}>
            <button
              style={{
                flex: 1,
                background: "linear-gradient(90deg,#00ffab,#00cfff 90%)",
                color: "#181c20",
                fontWeight: 700,
                fontSize: 16,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 12px #00ffb8a1",
                cursor: "pointer"
              }}
              onClick={() => router.push("/space")}
            >Go to Space</button>
            <button
              style={{
                flex: 1,
                background: "linear-gradient(90deg,#181d20,#181d29 95%)",
                color: "#18ffb9",
                fontWeight: 700,
                fontSize: 16,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 12px #181f2997",
                cursor: "pointer"
              }}
              onClick={() => router.push("/ideaflight")}
            >Create Ideaflight</button>
          </div>

          {/* Ideaflight panel */}
          <MotionSection>
            <MotionCard title="Ideaflight">
              <div style={{ minHeight: 80, color: "#fff" }}>
                Submit, organize, and launch your next big idea.
                {/* Could include list/tableview of ideaflights here */}
              </div>
            </MotionCard>
          </MotionSection>
        </div>
      </div>

      {/* FAM Awards + Now Happening (modular; real Supabase data) */}
      <div style={{
        position: "absolute",
        left: 20, right: 20, bottom: 10, zIndex: 8,
        display: "flex", gap: 38, justifyContent: "center"
      }}>
        <MotionSection>
          <MotionCard title="FAM Awards">
            <div style={{ display: "flex", gap: 12, overflowX: "auto", maxWidth: 440 }}>
              {famAwards.length === 0 && <div>No awards yet.</div>}
              {famAwards.map(a => (
                <div key={a.id} style={{ minWidth: 130 }}>
                  <img src={a.img_url} alt={a.award_name} style={{ width: 110, height: 110, borderRadius: 18 }} />
                  <div style={{ color: "#fff", fontWeight: 600 }}>{a.award_name}</div>
                  <div style={{ fontSize: 13, color: "#98fff1" }}>{a.winner}</div>
                  <div style={{ fontSize: 12, color: "#18ffb9" }}>{a.year}</div>
                </div>
              ))}
            </div>
          </MotionCard>
        </MotionSection>
        <MotionSection>
          <MotionCard title="Happening Now">
            <div style={{ display: "flex", gap: 14, overflowX: "auto", maxWidth: 420 }}>
              {liveEvents.length === 0 && <div>No live events yet.</div>}
              {liveEvents.map(e => (
                <div key={e.id} style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: "#fff" }}>{e.event_name}</div>
                  <div style={{ fontSize: 13, color: "#18ffb9" }}>{e.date}</div>
                  <div style={{ fontSize: 13, color: "#98fff1" }}>{e.venue}</div>
                </div>
              ))}
            </div>
          </MotionCard>
        </MotionSection>
      </div>
    </div>
  );
}
