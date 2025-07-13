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
      <Component {...pageProps} />
      <Toaster position="top-center" reverseOrder={false} />

      {/* Bottom Tab Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          background: "#181825",
          padding: "10px 0",
          borderTop: "1px solid #333",
          zIndex: 1000,
        }}
      >
        {/* Left: Hip Session */}
        <button
          onClick={() => router.push("/hipsession")}
          style={{
            background: "transparent",
            color: "#fff",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          HipSession
        </button>

        {/* Middle: Home */}
        <button
          onClick={() => router.push("/")}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
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
            color: "#fff",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Space
        </button>
      </div>
    </>
  );
}
