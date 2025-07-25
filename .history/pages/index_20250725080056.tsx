// pages/index.tsx

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import PlaySpaceToggle from "@/components/PlaySpaceToggle";
import PlaySpaceGallery from "@/components/PlaySpaceGallery";
import HoverGuideHUD from "@/components/HoverGuideHUD";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const ADMIN_EMAIL = "burks.donte@gmail.com";

interface Coin {
  id: string;
  name: string;
  value: number;
  // Add other fields as needed
}

export default function Home() {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [user, setUser] = useState(null);
  const [sceneMode, setSceneMode] = useState("cart");
  const [showPlaySpace, setShowPlaySpace] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const signinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabaseClient
        .from("planetary-design")
        .select("image_url")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load gallery images:", error);
      } else {
        setGalleryImages(data.map((row) => row.image_url));
      }
    };
    fetchImages();
  }, []);

  const scrollToSignin = () => {
    if (signinRef.current) {
      signinRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative", padding: 24 }}>
      {/* --- Toggle Button --- */}
      <button
        onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
        style={{
          position: "absolute",
          top: 18,
          right: 32,
          zIndex: 22,
          background: "#18181b",
          color: "#f3ba2f",
          fontWeight: 900,
          fontFamily: "monospace",
          fontSize: 20,
          border: "2.5px solid #ffe14a",
          borderRadius: 16,
          padding: "12px 32px",
          boxShadow: "0 4px 24px #0af4, 0 2px 18px #ffe14a40",
          letterSpacing: "0.22em",
          transition: "background 0.22s, color 0.22s",
          cursor: "pointer",
          userSelect: "none"
        }}
        title="Toggle 3D Cart & Closet"
        aria-label="Toggle 3D Cart and Closet view"
      >
        C.A.RT
      </button>

      {/* Toggle Play Space */}
      <PlaySpaceToggle open={showPlaySpace} onToggle={() => setShowPlaySpace(prev => !prev)} />

      {/* --- 3D Scene --- */}
      <div
        style={{// pages/index.tsx

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import PlaySpaceToggle from "@/components/PlaySpaceToggle";
import PlaySpaceGallery from "@/components/PlaySpaceGallery";
import HoverGuideHUD from "@/components/HoverGuideHUD";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const ADMIN_EMAIL = "burks.donte@gmail.com";

interface Coin {
  id: string;
  name: string;
  value: number;
  // Add other fields as needed
}

export default function Home() {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [user, setUser] = useState(null);
  const [sceneMode, setSceneMode] = useState("cart");
  const [showPlaySpace, setShowPlaySpace] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const signinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabaseClient
        .from("planetary-design")
        .select("image_url")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load gallery images:", error);
      } else {
        setGalleryImages(data.map((row) => row.image_url));
      }
    };
    fetchImages();
  }, []);

  const scrollToSignin = () => {
    if (signinRef.current) {
      signinRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative", padding: 24 }}>
      {/* --- Toggle Button --- */}
      <button
        onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
        style={{
          position: "absolute",
          top: 18,
          right: 32,
          zIndex: 22,
          background: "#18181b",
          color: "#f3ba2f",
          fontWeight: 900,
          fontFamily: "monospace",
          fontSize: 20,
          border: "2.5px solid #ffe14a",
          borderRadius: 16,
          padding: "12px 32px",
          boxShadow: "0 4px 24px #0af4, 0 2px 18px #ffe14a40",
          letterSpacing: "0.22em",
          transition: "background 0.22s, color 0.22s",
          cursor: "pointer",
          userSelect: "none"
        }}
        title="Toggle 3D Cart & Closet"
        aria-label="Toggle 3D Cart and Closet view"
      >
        C.A.RT
      </button>

      {/* Toggle Play Space */}
      <PlaySpaceToggle open={showPlaySpace} onToggle={() => setShowPlaySpace(prev => !prev)} />

      {/* --- 3D Scene --- */}
      <div
        style={{
          height: 440,
          width: "100%",
          margin: "0 auto 20px",
          borderRadius: 16,
          boxShadow: "0 0 30px #0af3",
          overflow: "hidden",
          userSelect: "none",
          position: "relative"
        }}
      ></div>

      {/* --- Play Space Gallery --- */}
      {showPlaySpace && (
        <PlaySpaceGallery images={galleryImages} />
      )}

      {/* --- Avatar Selector --- */}
      <AvatarClothingSelector />

      {/* --- Floating HUD --- */}
      <HoverGuideHUD isSignedIn={!!user} scrollToId="signin-section" />

      {/* --- Sign-in Target --- */}
      <div ref={signinRef} id="signin-section" style={{ marginTop: 80 }}>
        {/* Optional: render your actual auth form here */}
      </div>
    </div>
  );
}

          height: 440,
          width: "100%",
          margin: "0 auto 20px",
          borderRadius: 16,
          boxShadow: "0 0 30px #0af3",
          overflow: "hidden",
          userSelect: "none",
          position: "relative"
        }}
      ></div>

      {/* --- Play Space Gallery --- */}
      {showPlaySpace && (
        <PlaySpaceGallery images={galleryImages} />
      )}

      {/* --- Avatar Selector --- */}
      <AvatarClothingSelector />

      {/* --- Floating HUD --- */}
      <HoverGuideHUD isSignedIn={!!user} scrollToId="signin-section" />

      {/* --- Sign-in Target --- */}
      <div ref={signinRef} id="signin-section" style={{ marginTop: 80 }}>
        {/* Optional: render your actual auth form here */}
      </div>
    </div>
  );
}
