import React from "react";

type Props = {
  department: string;
  aiPick?: boolean;
  media?: any[]; // array of media for this department
};

const BusinessCarousel = ({ department, aiPick = false, media = [] }: Props) => {
  // Just a demo: you can replace this with a fancy carousel UI
  return (
    <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 10 }}>
      {media.length === 0 ? (
        <div style={{ color: "#bbb" }}>No media for {department}</div>
      ) : (
        media.map(m => (
          <div key={m.id} style={{ minWidth: 220, background: "#191c24", borderRadius: 12, boxShadow: "0 2px 16px #0af2", padding: 12 }}>
            {m.img_url && <img src={m.img_url} style={{ width: "100%", borderRadius: 8, marginBottom: 8 }} alt={m.title} />}
            {m.video_url && <video src={m.video_url} controls style={{ width: "100%", borderRadius: 8, marginBottom: 8 }} />}
            <div style={{ fontWeight: 600, color: "#fff" }}>{m.title}</div>
            <div style={{ fontSize: 13, color: "#9ae6b4" }}>{m.description}</div>
            {m.link_url && (
              <a href={m.link_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0af", fontSize: 14 }}>
                Visit
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default BusinessCarousel;
