import React from "react";

const mockImages = [
  "https://images.unsplash.com/photo-1682685794377-7f0cb6b84ab9",
  "https://images.unsplash.com/photo-1605733160314-4d40612f7f06",
  "https://images.unsplash.com/photo-1503342452485-86a3979a3f1d",
];

const PlaySpaceGallery: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>Play Space Renders</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "16px",
        }}
      >
        {mockImages.map((url, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              background: "#1f2937",
              boxShadow: "0 0 12px #0af5",
            }}
          >
            <img
              src={`${url}?w=400`}
              alt={`Render ${i + 1}`}
              style={{ width: "100%", display: "block" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaySpaceGallery;
