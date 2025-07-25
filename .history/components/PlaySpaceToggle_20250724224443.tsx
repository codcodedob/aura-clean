import React from "react";

interface PlaySpaceToggleProps {
  open: boolean;
  onToggle: () => void;
}

const PlaySpaceToggle: React.FC<PlaySpaceToggleProps> = ({ open, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "absolute",
        top: 24,
        left: 32,
        zIndex: 10,
        padding: "10px 16px",
        borderRadius: 12,
        background: open ? "#facc15" : "#0af",
        color: "#111",
        fontWeight: 700,
        border: "none",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {open ? "Close Play Space" : "🧪 Enter Play Space"}
    </button>
  );
};

export default PlaySpaceToggle;
