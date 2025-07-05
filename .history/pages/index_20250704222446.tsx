// pages/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Music" | "Art" | "Clothing" | "Food";
  image: string;
  isNew?: boolean;
  isPopular?: boolean;
  discount?: number; // percent off
};

const CATEGORIES = [
  { key: "Music", label: "Music Albums" },
  { key: "Art", label: "Custom Art Albums & Collections" },
  { key: "Clothing", label: "Clothing" },
  { key: "Food", label: "Food" },
] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [bannerProduct, setBannerProduct] = useState<Product | null>(null);

  // Fetch products (replace with your real API)
  useEffect(() => {
    // Simulated data fetch
    setProducts([
      {
        id: "1",
        name: "Summer Beats Vol. 1",
        description: "A collection of the hottest tracks this season.",
        price: 12,
        category: "Music",
        image: "/music1.jpg",
        isPopular: true,
      },
      {
        id: "2",
        name: "Abstract Visions",
        description: "Limited edition digital art collection.",
        price: 80,
        category: "Art",
        image: "/art1.jpg",
        isNew: true,
        discount: 20,
      },
      {
        id: "3",
        name: "Signature Hoodie",
        description: "Ultra-soft hoodie, available in all sizes.",
        price: 45,
        category: "Clothing",
        image: "/clothing1.jpg",
        isPopular: true,
      },
      {
        id: "4",
        name: "Gourmet Snack Box",
        description: "A box of curated, chef-made snacks.",
        price: 28,
        category: "Food",
        image: "/food1.jpg",
        isNew: true,
      },
      // ...more products
    ]);
  }, []);

  useEffect(() => {
    // Pick the most popular or newest as banner
    const featured = products.find(p => p.isPopular) || products.find(p => p.isNew) || products[0];
    setBannerProduct(featured || null);
  }, [products]);

  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  // --- UI ---
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Banner */}
      {bannerProduct && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          style={{
            background: "#f9fafb",
            padding: "48px 0 32px 0",
            textAlign: "center",
            borderBottom: "2px solid #f0f4fa",
            position: "relative",
          }}
        >
          <img
            src={bannerProduct.image}
            alt={bannerProduct.name}
            style={{
              width: "min(90vw, 420px)",
              height: 220,
              objectFit: "cover",
              borderRadius: 18,
              boxShadow: "0 4px 44px #0af2",
              marginBottom: 16,
            }}
          />
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "12px 0 8px 0", color: "#12395f" }}>
            {bannerProduct.name}
          </h1>
          <p style={{ fontSize: 18, color: "#567", maxWidth: 540, margin: "0 auto 10px" }}>
            {bannerProduct.description}
          </p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            onClick={() => handleAddToCart(bannerProduct.id)}
            style={{
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 10,
              border: "none",
              padding: "15px 38px",
              fontSize: 20,
              marginTop: 12,
              cursor: "pointer",
              boxShadow: "0 2px 18px #0050fc10"
            }}
          >
            {bannerProduct.discount ? (
              <span>
                Buy Now <span style={{ color: "#ff3d3d", marginLeft: 12, fontWeight: 500 }}>
                  <AnimatedDiscount discount={bannerProduct.discount} />
                </span>
              </span>
            ) : (
              "Buy Now"
            )}
          </motion.button>
          {bannerProduct.isNew && (
            <span style={{
              position: "absolute", top: 24, left: 24,
              background: "#10b981", color: "#fff", padding: "6px 18px",
              borderRadius: 20, fontWeight: 700, fontSize: 15
            }}>NEW</span>
          )}
          {bannerProduct.isPopular && (
            <span style={{
              position: "absolute", top: 24, right: 24,
              background: "#2563eb", color: "#fff", padding: "6px 18px",
              borderRadius: 20, fontWeight: 700, fontSize: 15
            }}>POPULAR</span>
          )}
        </motion.div>
      )}

      {/* Categories */}
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "40px 0 60px 0",
        display: "flex", flexDirection: "column", gap: 54
      }}>
        {CATEGORIES.map(cat => (
          <section key={cat.key}>
            <h2 style={{
              fontSize: 28, fontWeight: 700, color: "#1d2e45",
              marginBottom: 18, borderLeft: "5px solid #2563eb", paddingLeft: 12
            }}>
              {cat.label}
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 32,
            }}>
              {products.filter(p => p.category === cat.key).map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.035, boxShadow: "0 6px 32px #0af3" }}
                  style={{
                    background: "#fff",
                    border: "2px solid #f0f4fa",
                    borderRadius: 14,
                    padding: 20,
                    position: "relative",
                    transition: "box-shadow 0.18s",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 10,
                        marginBottom: 10,
                        transition: "filter 0.2s"
                      }}
                    />
                    {/* Hover overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(30,40,80,0.13)",
                        borderRadius: 10,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none"
                      }}
                    >
                      <span style={{
                        background: "#2563eb",
                        color: "#fff",
                        padding: "7px 18px",
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: 16,
                        marginBottom: 6
                      }}>
                        {product.isNew ? "New Arrival" : product.isPopular ? "Popular" : "Featured"}
                      </span>
                      <span style={{
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: 15,
                        background: "#1d2e45cc",
                        padding: "7px 12px",
                        borderRadius: 8
                      }}>
                        {product.description}
                      </span>
                    </motion.div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 19, color: "#12395f" }}>{product.name}</h3>
                    <p style={{ color: "#567", fontSize: 15, margin: "5px 0 7px 0", minHeight: 32 }}>
                      {product.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 18, color: "#2563eb" }}>
                        {product.discount ? (
                          <>
                            <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: 15, marginRight: 7 }}>
                              ${product.price.toFixed(2)}
                            </span>
                            <span style={{ color: "#ff3d3d" }}>
                              ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>${product.price.toFixed(2)}</>
                        )}
                      </span>
                      {product.discount && (
                        <span style={{
                          background: "#ff3d3d",
                          color: "#fff",
                          borderRadius: 8,
                          padding: "2px 8px",
                          fontSize: 13,
                          fontWeight: 600,
                          marginLeft: 4
                        }}>
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      style={{
                        marginTop: 12,
                        background: "#2563eb",
                        color: "#fff",
                        fontWeight: 700,
                        borderRadius: 8,
                        border: "none",
                        padding: "11px 22px",
                        fontSize: 16,
                        cursor: "pointer",
                        width: "100%"
                      }}
                    >
                      Add to Cart
                    </button>
                    <Link href={`/product/${product.id}`}>
                      <button
                        style={{
                          marginTop: 8,
                          background: "#fff",
                          color: "#2563eb",
                          fontWeight: 700,
                          borderRadius: 8,
                          border: "2px solid #2563eb",
                          padding: "8px 0",
                          fontSize: 15,
                          width: "100%",
                          cursor: "pointer"
                        }}
                      >
                        View Details
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cart Overlay (simple) */}
      {Object.keys(cart).length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 4px 32px #0af2",
            padding: "22px 34px",
            zIndex: 99,
            minWidth: 260,
            border: "2px solid #2563eb"
          }}
        >
          <h4 style={{ fontWeight: 700, fontSize: 19, color: "#2563eb", marginBottom: 10 }}>🛒 Cart</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {Object.entries(cart).map(([id, qty]) => {
              const prod = products.find(p => p.id === id);
              if (!prod) return null;
              const price = prod.discount
                ? prod.price * (1 - prod.discount / 100)
                : prod.price;
              return (
                <li key={id} style={{ marginBottom: 7, color: "#222" }}>
                  <span style={{ fontWeight: 600 }}>{prod.name}</span> x{qty} — <span style={{ color: "#2563eb" }}>${(price * qty).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
          <div style={{ borderTop: "1px solid #eee", margin: "14px 0" }} />
          <div style={{ fontWeight: 700, color: "#12395f", fontSize: 17 }}>
            Total: $
            {Object.entries(cart).reduce((sum, [id, qty]) => {
              const prod = products.find(p => p.id === id);
              if (!prod) return sum;
              const price = prod.discount
                ? prod.price * (1 - prod.discount / 100)
                : prod.price;
              return sum + price * qty;
            }, 0).toFixed(2)}
          </div>
          <Link href="/checkout">
            <button style={{
              marginTop: 18,
              background: "#10b981",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 8,
              border: "none",
              padding: "13px 0",
              fontSize: 17,
              width: "100%",
              cursor: "pointer"
            }}>
              Go to Checkout
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

// --- Animated Discount Overlay ---
function AnimatedDiscount({ discount }: { discount: number }) {
  const [time, setTime] = useState(10);
  useEffect(() => {
    if (time <= 0) return;
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);
  return (
    <span>
      -{discount}% <span style={{ fontSize: 13, color: "#ff3d3d" }}>{time > 0 ? `Ends in ${time}s!` : "Deal Ended"}</span>
    </span>
  );
}
