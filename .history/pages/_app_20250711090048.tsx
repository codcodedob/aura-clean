// pages/_app.tsx
import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const trackVisit = async (url: string) => {
      await fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    };

    trackVisit(window.location.href);

    router.events.on("routeChangeComplete", trackVisit);
    return () => {
      router.events.off("routeChangeComplete", trackVisit);
    };
  }, [router.events]);

  return (
    <>
      {/* Wrap Component in a div to add bottom padding */}
      <div style={{ paddingBottom: 70 }}>
        <Component {...pageProps} />
      </div>

      <Toaster position="top-center" reverseOrder={false} />

      {/* Bottom Navigation Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          background: "#1f2937", // Tailwind slate-800
          padding: "10px 0",
          borderTop: "1px solid #374151", // Tailwind slate-700
          zIndex: 1000,
          boxShadow: "0 -1px 4px rgba(0,0,0,0.2)",
        }}
      >
        {/* Left: HipSession */}
        <button
          onClick={() => router.push("/hipsession")}
          style={{
            background: "transparent",
            color: "#e5e7eb", // Tailwind gray-200
            border: "none",
            fontSize: 16,
            padding: "6px 12px",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#3b82f6")} // blue-500
          onMouseOut={(e) => (e.currentTarget.style.color = "#e5e7eb")}
        >
          HipSession
        </button>

        {/* Middle: Home */}
        <button
          onClick={() => router.push("/")}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Home
        </button>

        {/* Right: Space */}
        <button
          onClick={() => router.push("/space")}
          style={{
            background: "transparent",
            color: "#e5e7eb",
            border: "none",
            fontSize: 16,
            padding: "6px 12px",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#3b82f6")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#e5e7eb")}
        >
          Space
        </button>
      </div>
    </>
  );
}
