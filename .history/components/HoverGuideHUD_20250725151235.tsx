import React, { useEffect, useRef, useState } from "react";
import DobeChatModal from "./DobeChatModal"; // Your chat component

interface HoverGuideHUDProps {
  isSignedIn: boolean;
}

const HUD_SIZE = 72;

const HoverGuideHUD: React.FC<HoverGuideHUDProps> = ({ isSignedIn = false }) => {
  const hudRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 32, y: 32 });
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );
  const [showChat, setShowChat] = useState(false);

  // Live clock if signed in
  useEffect(() => {
    if (isSignedIn) {
      const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  // Drag logic with bounds (mouse + touch)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPos((prev) => {
        const newX = Math.min(Math.max(0, prev.x + e.movementX), window.innerWidth - HUD_SIZE);
        const newY = Math.min(Math.max(0, prev.y + e.movementY), window.innerHeight - HUD_SIZE);
        return { x: newX, y: newY };
      });
    };
    const handleMouseUp = () => setDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging || !e.touches.length) return;
      const touch = e.touches[0];
      setPos({
        x: Math.min(Math.max(0, touch.clientX - touchOffset.x), window.innerWidth - HUD_SIZE),
        y: Math.min(Math.max(0, touch.clientY - touchOffset.y), window.innerHeight - HUD_SIZE),
      });
    };
    const handleTouchEnd = () => setDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, touchOffset]);

  // Desktop drag
  const handleMouseDown = () => setDragging(true);

  // Mobile drag
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!hudRef.current) return;
    const rect = hudRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setTouchOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setDragging(true);
  };

  return (
    <>
      {/* HUD Button */}
      <div
        ref={hudRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          if (!dragging) setShowChat(true);
        }}
        title="This is Dobe Research – Tap to ask"
        style={{
          position: "fixed",
          top: pos.y,
          left: pos.x,
          zIndex: 9999,
          width: HUD_SIZE,
          height: HUD_SIZE,
          borderRadius: "50%",
          background: isSignedIn ? "#0af" : "#22c55e",
          boxShadow: isSignedIn
            ? "0 0 16px #0af8"
            : "0 0 18px 4px #4ade80, 0 0 40px 10px #22c55e88",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          userSelect: "none",
          cursor: dragging ? "grabbing" : "grab",
          animation: !isSignedIn ? "pulseRing 1.5s infinite" : "none",
          border: !isSignedIn ? "2.5px solid #bbf7d0" : "none",
          transition: "all 0.3s ease",
          touchAction: "none", // disables browser drag-to-scroll for best results
        }}
      >
        {isSignedIn ? time : "Dobe"}
        {/* CSS Spinning coin (only if not signed in) */}
        {!isSignedIn && (
          <span
            style={{
              position: "absolute",
              width: 36,
              height: 36,
              left: 18,
              top: 18,
              pointerEvents: "none",
              animation: "spinCoin 1s linear infinite"
            }}
          >
            <svg width={36} height={36} viewBox="0 0 36 36" style={{ filter: "drop-shadow(0 0 6px #a7f3d0)" }}>
              <circle cx={18} cy={18} r={16} fill="#bbf7d0" stroke="#14b8a6" strokeWidth={3} />
              <text x="18" y="23" textAnchor="middle" fontSize="16" fill="#22c55e" fontWeight="bold">$</text>
            </svg>
          </span>
        )}
      </div>

      {/* Speech Bubble Prompt + Arrow */}
      {!isSignedIn && (
        <>
          {/* Arrow */}
          <div
            style={{
              position: "fixed",
              top: pos.y + HUD_SIZE - 2,
              left: pos.x + HUD_SIZE / 2 - 10,
              zIndex: 10000,
              width: 40,
              height: 40,
              pointerEvents: "none",
              transform: "rotate(90deg)"
            }}
          >
            <svg width="40" height="40">
              <polygon points="20,0 40,40 0,40" fill="#bbf7d0" />
            </svg>
          </div>
          {/* Bubble */}
          <div
            style={{
              position: "fixed",
              top: pos.y + HUD_SIZE + 38,
              left: pos.x - 16,
              zIndex: 10000,
              background: "#bbf7d0",
              color: "#065f46",
              borderRadius: 12,
              padding: "11px 18px",
              fontWeight: 600,
              fontSize: 15,
              minWidth: 200,
              boxShadow: "0 2px 14px #a7f3d0",
              userSelect: "none",
              maxWidth: 240
            }}
          >
            Scroll down and sign in or create your Adob ID to unlock everything!
          </div>
        </>
      )}

      {showChat && <DobeChatModal onClose={() => setShowChat(false)} />}

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 #22c55e77, 0 0 20px #22c55e; }
          70% { box-shadow: 0 0 0 15px #bbf7d033, 0 0 32px #22c55e; }
          100% { box-shadow: 0 0 0 0 #22c55e00, 0 0 20px #22c55e; }
        }
        @keyframes spinCoin {
          0% { transform: rotateY(0deg);}
          100% { transform: rotateY(360deg);}
        }
      `}</style>
    </>
  );
};

export default HoverGuideHUD;
