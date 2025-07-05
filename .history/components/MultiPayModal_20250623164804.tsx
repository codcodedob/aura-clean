import React from "react"

interface PaymentOption {
  name: string
  src: string
  color: string
}

const paymentOptions: PaymentOption[] = [
  { name: "Cash App", src: "/qrs/cashapp.png", color: "#06C755" },
  { name: "Zelle", src: "/qrs/zelle.png", color: "#6A1B9A" },
  { name: "PayPal", src: "/qrs/paypal.png", color: "#FFC439" },
  { name: "Venmo", src: "/qrs/venmo.png", color: "#3D95CE" },
]

export default function MultiPayModal({
  open,
  amount,
  coinName,
  onClose,
  onStripe,
  isZeroAmount,
}: {
  open: boolean
  amount: number
  coinName: string
  onClose: () => void
  onStripe: () => void
  isZeroAmount: boolean
}) {
  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#222",
          padding: 32,
          borderRadius: 18,
          boxShadow: "0 8px 48px #000a",
          minWidth: 320,
          maxWidth: 400,
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: "#0af", marginBottom: 12 }}>
          {isZeroAmount ? "Confirm Free Purchase" : "Choose a Payment Method"}
        </h2>
        <div style={{ marginBottom: 18, color: "#fff" }}>
          {isZeroAmount ? (
            <>
              <p>
                You’re about to get <b>{coinName}</b> for <b>FREE</b>.<br />
                Confirm to complete your order.
              </p>
            </>
          ) : (
            <>
              <p>
                Complete your purchase of <b>{coinName}</b>.<br />
                <span style={{ color: "#0af", fontWeight: 600 }}>
                  Amount: ${amount.toFixed(2)}
                </span>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 14 }}>
                {paymentOptions.map((opt) => (
                  <div key={opt.name} style={{ marginBottom: 10 }}>
                    <img src={opt.src} alt={opt.name + " QR"} style={{ width: 100, borderRadius: 8, border: `2px solid ${opt.color}` }} />
                    <div style={{ color: opt.color, fontWeight: 600, fontSize: 15 }}>{opt.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ margin: "18px 0" }}>
                <button
                  onClick={onStripe}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 7,
                    background: "#0af",
                    color: "#000",
                    fontWeight: "bold",
                    border: "none",
                    fontSize: 16,
                  }}
                >
                  Pay with Card (Stripe)
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={onClose} style={{ marginTop: 4, color: "#fff", background: "transparent", border: "none", fontSize: 14 }}>
          Cancel
        </button>
        {isZeroAmount && (
          <button
            onClick={onStripe}
            style={{
              marginLeft: 12,
              marginTop: 4,
              color: "#fff",
              background: "#0af",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              fontWeight: "bold",
            }}
          >
            Confirm Free Purchase
          </button>
        )}
      </div>
    </div>
  )
}
