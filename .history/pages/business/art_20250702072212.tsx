import React, { useState } from "react";
import Link from "next/link";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const onboardingSteps = [
  "Create Account",
  "Complete Profile",
  "Choose Art Role",
  "Upload Portfolio",
  "Set Up Wallet",
  "Get Verified",
  "Go Public (Artgang)",
];

const famAwardsDemo = [
  {
    id: "1",
    title: "Best New Artist",
    media: "/awards/artist1.jpg",
    winner: "Jane D.",
    video: "",
  },
  {
    id: "2",
    title: "Best Product",
    media: "/awards/product1.jpg",
    winner: "CanvasX",
    video: "",
  },
];

const liveTicketsDemo = [
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

// Styles for the timeline steps and bar
const timelineContainer: React.CSSProperties = {
  position: "sticky",
  top: 0,
  left: 0,
  width: "100vw",
  background: "linear-gradient(90deg, #0d111a 80%, #232943 100%)",
  zIndex: 40,
  padding: "36px 0 22px 0",
  marginBottom: 32,
  boxShadow: "0 4px 24px #0af3",
  overflowX: "auto",
};

const stepStyles = (active: boolean, complete: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: 100,
  position: "relative",
  color: complete ? "#1de9b6" : active ? "#fecf2f" : "#333",
  fontWeight: 700,
  fontSize: 15,
  transition: "color 0.25s cubic-bezier(.7,.1,.1,1)",
  cursor: complete ? "pointer" : active ? "pointer" : "default",
  zIndex: 2,
});

const dotStyles = (active: boolean, complete: boolean): React.CSSProperties => ({
  width: 26,
  height: 26,
  borderRadius: "50%",
  background: complete ? "linear-gradient(120deg,#27ff99,#00e6f6 80%)" : active ? "#fecf2f" : "#242831",
  border: active || complete ? "3px solid #fff" : "2px solid #223",
  boxShadow: active ? "0 0 12px #ffe20088" : complete ? "0 0 10px #21e8b022" : "",
  marginBottom: 9,
  transition: "background 0.23s cubic-bezier(.7,.1,.1,1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export default function ArtDepartment() {
  const [onboardIndex, setOnboardIndex] = useState(2); // Demo: step 3 in progress
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const router = useRouter();

  return (
    <div style={{ background: "#191c24", minHeight: "100vh", color: "#fff", padding: 0 }}>
      {/* ---- Onboarding Timeline ---- */}
      <div style={timelineContainer}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}>
          {/* Step dots and labels */}
          {onboardingSteps.map((step, i) => {
            const complete = i < onboardIndex;
            const active = i === onboardIndex;
            return (
              <div
                key={step}
                style={stepStyles(active, complete)}
                onClick={() => i <= onboardIndex && setOnboardIndex(i)}
              >
                <div style={dotStyles(active, complete)}>
                  {/* Step number or checkmark for completed */}
                  {complete ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: 16,
                        lineHeight: "26px",
                      }}
                    >✓</motion.span>
                  ) : (
                    <span style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 15,
                      opacity: active ? 1 : 0.65,
                    }}>{i + 1}</span>
                  )}
                </div>
                <span style={{
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  opacity: complete ? 0.95 : active ? 1 : 0.7,
                  textShadow: active ? "0 2px 10px #ffe200a3" : "",
                }}>
                  {step}
                </span>
                {/* Progress bar segment */}
                {i < onboardingSteps.length - 1 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: i < onboardIndex ? 54 : i === onboardIndex ? 32 : 20,
                      background: i < onboardIndex ? "#1de9b6" : "#30324c",
                    }}
                    transition={{
                      duration: 0.46,
                      delay: i < onboardIndex ? 0.05 : 0,
                      type: "tween"
                    }}
                    style={{
                      position: "absolute",
                      top: 11,
                      left: "calc(100% + 2px)",
                      height: 6,
                      borderRadius: 4,
                      zIndex: 1,
                      boxShadow: i < onboardIndex ? "0 0 9px #1de9b6" : "",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Main Grid ---- */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 28,
        maxWidth: 1300,
        margin: "0 auto",
        padding: "38px 18px 24px 18px",
      }}>
        {/* Left: AGX License/Wallet/Go Public */}
        <div style={{ flex: "1 1 340px", minWidth: 340 }}>
          {/* AGX License/Worker Panel */}
          <div style={{ marginBottom: 28 }}>
            <button
              style={{
                padding: "10px 22px",
                borderRadius: 8,
                background: "#10b981",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                marginRight: 14,
              }}
              onClick={() => router.push("/artgang")}
            >
              Artgang Panel
            </button>
            {/* You can add more quick links or info here */}
          </div>
          {/* Wallet Panel */}
          <div style={{ marginBottom: 32 }}>
            <WalletPanel />
            <div style={{
              fontSize: 14,
              color: "#0af7",
              marginTop: 4,
              maxWidth: 220
            }}>
              Connect your agent wallet/API for payments, royalties, and digital assets.
            </div>
          </div>
        </div>

        {/* Middle: Fam Awards & Happenings */}
        <div style={{ flex: "1 1 380px", minWidth: 360 }}>
          {/* Fam Awards */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>FAM Awards</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {famAwardsDemo.map((a) => (
                <div
                  key={a.id}
                  style={{
                    minWidth: 200,
                    background: "#222",
                    borderRadius: 14,
                    padding: 12,
                    boxShadow: "0 2px 16px #0af1",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{a.title}</div>
                  <img
                    src={a.media}
                    alt={a.title}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      margin: "10px 0",
                    }}
                  />
                  <div style={{ fontSize: 13, color: "#fefc" }}>
                    Winner: <b>{a.winner}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Happening Now & Upcoming Panel */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Happening Now & Upcoming</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {liveTicketsDemo.map((t) => (
                <div
                  key={t.id}
                  style={{
                    minWidth: 200,
                    background: "#191c24",
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
                      <div
                        style={{
                          fontSize: 13,
                          color: "#fecf2f",
                          margin: "4px 0",
                        }}
                      >
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

        {/* Right: IdeaFlight and Space Panel */}
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div style={{
            background: "#181c22",
            borderRadius: 12,
            padding: 20,
            marginBottom: 28,
            fontWeight: 600,
            boxShadow: "0 2px 16px #00ffdd23",
            minHeight: 120,
            position: "relative"
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
              IdeaFlight
            </div>
            <p style={{ fontSize: 15, color: "#ccc" }}>
              Organize, launch, and collaborate on art, tech, and event ideas.
            </p>
            <div style={{
              position: "absolute", top: 14, right: 16, display: "flex", gap: 10
            }}>
              <button style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "#27ff99",
                color: "#111",
                fontWeight: 700,
                border: "none",
                marginRight: 6,
                fontSize: 15,
                boxShadow: "0 1px 8px #27ff9955",
                cursor: "pointer"
              }}>
                Create IdeaFlight
              </button>
              <button style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "#191c24",
                color: "#27ff99",
                fontWeight: 700,
                border: "2px solid #27ff99",
                fontSize: 15,
                boxShadow: "0 1px 8px #27ff9930",
                cursor: "pointer"
              }}>
                Go to Space
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
