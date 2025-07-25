import React, { useEffect, useRef, useState } from "react";
import DobeChatModal from "./DobeChatModal"; // ✨ Create this component below

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
          background: pulse ? "#facc15" : isSignedIn ? "#0af" : "#22c55e",
          boxShadow: pulse
            ? "0 0 12px #facc15, 0 0 20px #facc15aa"
            : isSignedIn
            ? "0 0 16px #0af8"
            : "0 0 12px #4ade80, 0 0 20px #22c55e",
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
        {pulse ? "🛎️" : isSignedIn ? time : "Dobe"}
      </div>

      {showChat && <DobeChatModal onClose={() => setShowChat(false)} />}
    </>
  );
};

export default HoverGuideHUD;
