import React, { useEffect, useState } from "react";

interface HoverGuideHUDProps {
  isSignedIn: boolean;
  scrollToId?: string;
}

const HoverGuideHUD: React.FC<HoverGuideHUDProps> = ({ isSignedIn, scrollToId = "signin-form" }) => {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );

  useEffect(() => {
    if (isSignedIn) {
      const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  const handleClick = () => {
    if (!isSignedIn) {
      const el = document.getElementById(scrollToId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 9999,
        background: isSignedIn ? "#0af" : "#22c55e",
        color: "#fff",
        padding: "14px 22px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 16,
        boxShadow: isSignedIn
          ? "0 0 16px #0af8"
          : "0 0 12px #4ade80, 0 0 20px #22c55e",
        cursor: "pointer",
        animation: isSignedIn ? "none" : "pulseGlow 2s infinite",
        transition: "all 0.3s ease"
      }}
    >
      {isSignedIn ? time : "🔐 Tap to Sign In"}
    </div>
  );
};

export default HoverGuideHUD;
