// pages/cancel.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Cancel() {
  const router = useRouter();

  useEffect(() => {
    alert("Payment canceled. You can return to the homepage.");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1>Payment Canceled</h1>
      <p>You have canceled the payment process.</p>
      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Go to Home Page
      </button>
    </div>
  );
}
