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

    // Track initial load
    trackVisit(window.location.href);

    // Track client-side navigations
    const handleRouteChange = (url: string) => {
      trackVisit(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
