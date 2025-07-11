import React, { useState } from "react";

// Define the type for your payment method
type PaymentMethod = {
  name: string;
  img: string | null;
};

// Keep your METHODS array typed
const METHODS: PaymentMethod[] = [
  { name: "PayPal", img: "/qr/paypal.png" },
  { name: "Cash App", img: "/qr/cashapp.png" },
  { name: "Zelle", img: "/qr/zelle.png" },
  { name: "Square", img: "/qr/square.png" },
  { name: "Stripe Card", img: null },
];

export default function MultiPayModal({
  onClose,
  amount,
  onSelectStripe,
}: {
  onClose: () => void;
  amount: number;
  onSelectStripe: () => void;
}) {
  // Make sure selected can be null or a PaymentMethod
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          minWidth: 340,
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            float: "right",
            fontSize: 20,
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <h2>Select Payment Method</h2>
        <p style={{ fontWeight: "bold", fontSize: 18 }}>
          Amount: ${amount.toFixed(2)}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            margin: "24px 0",
            flexWrap: "wrap",
          }}
        >
          {METHODS.filter((m) => m.name !== "Stripe Card").map((method) => (
            <button
              key={method.name}
              onClick={() => setSelected(method)}
              style={{
                border:
                  selected?.name === method.name
                    ? "2px solid #0af"
                    : "1px solid #ccc",
                borderRadius: 12,
                background: "#fafafa",
                padding: 14,
                cursor: "pointer",
              }}
            >
              <img
                src={method.img || "/placeholder.png"}
                alt={method.name}
                style={{ width: 60, height: 60, marginBottom: 8 }}
              />
              <div>{method.name}</div>
            </button>
          ))}
        </div>
        {/* Stripe Button */}
        <button
          onClick={onSelectStripe}
          style={{
            marginTop: 18,
            padding: "10px 18px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
          }}
        >
          Pay with Card (Stripe)
        </button>
        {selected && selected.img && (
          <div style={{ marginTop: 30 }}>
            <h3>{selected.name} QR Code</h3>
            <img
              src={selected.img}
              alt={`${selected.name} QR`}
              style={{
                width: 200,
                height: 200,
                margin: "10px auto",
              }}
            />
            <p style={{ fontSize: 13, color: "#333" }}>
              Scan QR with your app to pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
