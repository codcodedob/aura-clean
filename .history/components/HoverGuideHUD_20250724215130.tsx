import React, { useEffect, useRef, useState } from "react";

interface HoverGuideHUDProps {
  isSignedIn: boolean;
  onClick?: () => void;
  pulse?: boolean;
}

const HoverGuideHUD: React.FC<HoverGuideHUDProps> = ({
  isSignedIn,
  onClick,
  pulse = false
}) => {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );
  const hudRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 32, y: 32 });

  useEffect(() => {
    if (isSignedIn) {
      const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  // 🖱 Drag logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPos((prev) => ({
          x: Math.max(0, prev.x + e.movementX),
          y: Math.max(0, prev.y + e.movementY)
        }));
      }
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
    <div
      ref={hudRef}
      onMouseDown={() => setDragging(true)}
      onClick={() => {
        if (!dragging && onClick) onClick();
      }}
      title="Dobe Research — Ask AI"
      style={{
        position: "fixed",
        bottom: pos.y,
        right: pos.x,
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
  );
};

export default HoverGuideHUD;
