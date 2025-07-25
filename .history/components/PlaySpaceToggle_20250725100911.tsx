// PlaySpaceToggle.tsx
import React from "react";

type PlaySpaceToggleProps = {
  showPlaySpace: boolean;
  setShowPlaySpace: (val: boolean) => void;
};

export default function PlaySpaceToggle({ showPlaySpace, setShowPlaySpace }: PlaySpaceToggleProps) {
  return (
    <button
      onClick={() => setShowPlaySpace(!showPlaySpace)}
      style={{
        margin: "16px auto",
        display: "block",
        padding: "10px 26px",
        borderRadius: 14,
        background: showPlaySpace ? "#0af" : "#232a39",
        color: "#fff",
        fontWeight: "700",
        fontSize: 17,
        border: "2px solid #0af",
        cursor: "pointer",
        boxShadow: showPlaySpace ? "0 0 8px #0af7" : undefined,
        transition: "all 0.18s"
      }}
    >
      {showPlaySpace ? "Show Cart" : "Show Gallery"}
    </button>
  );
}
