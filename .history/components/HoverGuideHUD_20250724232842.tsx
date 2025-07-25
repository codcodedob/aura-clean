import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import DobeChatModal from "./DobeChatModal";

interface HoverGuideHUDProps {
  isSignedIn: boolean;
  scrollToId?: string; // ✅ Allow optional scroll target
}

const HoverGuideHUD: React.FC<HoverGuideHUDProps> = ({ isSignedIn, scrollToId }) => {
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(!isSignedIn);

  const handleClick = () => {
    if (!isSignedIn && scrollToId) {
      const el = document.getElementById(scrollToId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setOpen(true); // opens chat modal
    }
  };

  return (
    <>
      <Draggable bounds="parent">
        <div
          onClick={handleClick}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#0af",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 10,
            zIndex: 9999,
            cursor: "pointer",
            boxShadow: pulsing
              ? "0 0 0 4px rgba(0,255,128,0.4)"
              : "0 0 8px #0af",
            animation: pulsing ? "pulse 1.5s infinite" : "none",
          }}
          title="This is Dobe Research"
        >
          DO🧠BE
        </div>
      </Draggable>

      {open && <DobeChatModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default HoverGuideHUD;
