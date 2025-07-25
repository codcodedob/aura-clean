import React, { useEffect, useRef, useState } from "react";
import DobeChatModal from "./DobeChatModal";

interface HoverGuideHUDProps {
  isSignedIn: boolean;
  pulse?: boolean;
}

const HoverGuideHUD: React.FC<HoverGuideHUDProps> = ({ isSignedIn, pulse = false }) => {
  const hudRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 32, y: 32 });
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  // 🖱 Drag logic with bounds
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      setPos((prev) => {
        const newX = Math.min(Math.max(0, prev.x + e.movementX), window.innerWidth - 80);
        const newY = Math.min(Math.max(0, prev.y + e.movementY), window.innerHeight - 80);
        return { x: newX, y: newY };
      });
    };

    const handleMouseUp = () => setDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <>
      <div
        ref={hudRef}
        onMouseDown={() => setDragging(true)}
        onClick={() => {
          if (!dragging) setShowChat(true);
        }}
        title="This is Dobe Research – Tap to ask"
        style={{
          position: "fixed",
          top: pos.y,
          left: pos.x,
          zIndex: 9999,
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: pulse
            ? "#facc15"
            : isSignedIn
            ? "#0af"
            : "transparent", // make bg transparent for spinning coin
          boxShadow: pulse
            ? "0 0 12px #facc15, 0 0 20px #facc15aa"
            : isSignedIn
            ? "0 0 16px #0af8"
            : "none",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          userSelect: "none",
          cursor: "grab",
          animation: pulse ? "pulseGlow 2s infinite" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {pulse ? (
          "🛎️"
        ) : isSignedIn ? (
          time
        ) : (
          <div className="spinning-coin" style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #ffe14a 70%, #f59e0b 95%)",
            border: "2.5px solid #c9a100",
            boxShadow: "0 2px 18px #ffe14a80, 0 0 0 #f59e0b99 inset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "spincoin 0.75s linear infinite",
            position: "relative"
          }}>
            <span
              style={{
                fontSize: 30,
                position: "absolute",
                left: 0,
                right: 0,
                top: 2,
                textAlign: "center",
                color: "#b99c00"
              }}
            >🪙</span>
          </div>
        )}
      </div>

      {showChat && <DobeChatModal onClose={() => setShowChat(false)} />}

      {/* Inline style for spinning animation if needed */}
      <style>{`
        @keyframes spincoin {
          0% { transform: rotateY(0deg);}
          100% { transform: rotateY(360deg);}
        }
      `}</style>
    </>
  );
};

export default HoverGuideHUD;
