// pages/cart.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: number;
  name: string;
  price: number;
  img: string;
  quantity: number;
};

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const updateQuantity = (id: number, qty: number) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setCart(newCart);
    saveCart(newCart);
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    saveCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 6px 36px #e5e7eb", padding: 38 }}>
      <h1 style={{ fontWeight: 900, fontSize: 36, marginBottom: 24 }}>🛒 Your Cart</h1>
      {cart.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link href="/">
            <button style={{ background: "#2563eb", color: "#fff", borderRadius: 8, padding: "12px 26px", fontWeight: 700, marginTop: 20 }}>
              Back to Shopping
            </button>
          </Link>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee", padding: "14px 0" }}>
              <img src={item.img} alt={item.name} style={{ width: 62, height: 62, borderRadius: 8, marginRight: 18, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{item.name}</div>
                <div style={{ color: "#555" }}>${item.price}</div>
                <div>
                  <label style={{ marginRight: 10 }}>Qty:</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    style={{ width: 50, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                  />
                  <button onClick={() => removeItem(item.id)} style={{ marginLeft: 20, background: "#fa4b4b", color: "#fff", border: "none", borderRadius: 6, padding: "4px 14px", fontWeight: 700 }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: "right", fontSize: 22, fontWeight: 800, marginTop: 20 }}>
            Total: ${total.toFixed(2)}
          </div>
          <button style={{
            marginTop: 24,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 36px",
            fontWeight: 700,
            fontSize: 20,
            width: "100%"
          }}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
}
