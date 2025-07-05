import React, { useEffect, useState } from "react";
import OnboardingPanel from "@/components/OnboardingPanel"; // Make sure to create this!
import { useRouter } from "next/router";

// Dummy product data for demo
const PRODUCTS = {
  music: [
    { id: 1, name: "Neo Soul Album", desc: "Smooth vibes, modern soul.", price: 12, img: "/album1.jpg" },
    { id: 2, name: "Synth Pop Mix", desc: "80s style, 2020s flair.", price: 10, img: "/album2.jpg" }
  ],
  art: [
    { id: 3, name: "Digital Portrait", desc: "Custom vector portrait.", price: 49, img: "/art1.jpg" },
    { id: 4, name: "Abstract Canvas", desc: "Acrylic on canvas.", price: 120, img: "/art2.jpg" }
  ],
  clothing: [
    { id: 5, name: "Limited Tee", desc: "Organic cotton.", price: 35, img: "/shirt1.jpg" },
    { id: 6, name: "Windbreaker", desc: "Retro look, modern tech.", price: 69, img: "/jacket1.jpg" }
  ],
  food: [
    { id: 7, name: "Vegan Burger Kit", desc: "Cook at home.", price: 22, img: "/food1.jpg" },
    { id: 8, name: "Spicy Ramen", desc: "Handmade noodles.", price: 14, img: "/food2.jpg" }
  ]
};

function ProductCard({ product }: { product: any }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: hover ? "0 4px 32px #bbc8e3" : "0 2px 8px #e6e9f3",
        padding: 22,
        margin: 10,
        width: 210,
        minHeight: 280,
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.18s",
        transform: hover ? "scale(1.04)" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={product.img} alt={product.name} style={{ width: 120, height: 120, borderRadius: 8, objectFit: "cover" }} />
      <h4 style={{ fontSize: 19, fontWeight: 700, margin: "18px 0 4px 0" }}>{product.name}</h4>
      <p style={{ color: "#555", fontSize: 15, minHeight: 36 }}>{product.desc}</p>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#12395f", margin: "12px 0" }}>${product.price}</div>
      <button
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 7,
          padding: "10px 18px",
          fontWeight: 700,
          fontSize: 16,
          boxShadow: "0 1.5px 6px #0050fc13",
          width: "100%",
          marginTop: "auto"
        }}
      >Add to Cart</button>
    </div>
  );
}

function CategorySection({ title, products }: { title: string; products: any[] }) {
  return (
    <section style={{ margin: "38px 0" }}>
      <h2 style={{ fontSize: 27, fontWeight: 800, margin: "0 0 22px 12px", color: "#234" }}>{title}</h2>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

export default function Home() {
  // Example onboarding logic or product fetch here

  return (
    <div style={{
      background: "#f5f7fa",
      minHeight: "100vh",
      padding: "0",
      fontFamily: "Inter, sans-serif"
    }}>
      {/* Banner/Onboarding */}
      <OnboardingPanel />
      {/* Main Banner */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        margin: "18px auto 32px",
        maxWidth: 1200,
        textAlign: "center",
        boxShadow: "0 4px 32px #e1e9f7cc",
        padding: "58px 0 48px"
      }}>
        <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 8 }}>🔥 New & Popular Products</h1>
        <p style={{ color: "#345", fontSize: 19 }}>See what's trending across all categories.</p>
      </div>
      {/* Sections */}
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <CategorySection title="Music Albums" products={PRODUCTS.music} />
        <CategorySection title="Custom Art Albums & Collections" products={PRODUCTS.art} />
        <CategorySection title="Clothing" products={PRODUCTS.clothing} />
        <CategorySection title="Food" products={PRODUCTS.food} />
      </div>
    </div>
  );
}
