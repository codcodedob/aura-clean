// pages/index.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { BusinessOnboardingFlow, ArcSessionOnboardingFlow } from "@/components/OnboardFlow";

export default function Home() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("business"); // or "arc"
  const [profileStatus, setProfileStatus] = useState("onboarding");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCheckpointClick = async (step: string) => {
    if (!user) return;
    const { error } = await supabase.from("users").update({ onboarding_step: step }).eq("id", user.id);
    if (error) {
      console.error("Failed to update onboarding step:", error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: windowWidth < 768 ? '1rem' : '2rem 4rem',
      background: '#0c0c0c',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    }}>
      {/* Combined Onboarding Header Checkpoints */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0',
        background: '#111',
        borderBottom: '1px solid #222',
        gap: '1rem',
        position: 'relative'
      }}>
        {/* Decorative line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '2px',
          background: '#333',
          zIndex: 0
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          zIndex: 1
        }}>
          {['Create Account', 'Complete Profile', 'Choose Art Role', 'Upload Portfolio', 'Set Up Wallet', 'Get Verified', 'Go Public (Artgang)'].map(step => (
            <button
              key={step}
              onClick={() => handleCheckpointClick(step)}
              style={{
                background: 'transparent',
                color: '#39ff14',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              {step}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          zIndex: 1
        }}>
          {['halo id', 'birthday', 'age', 'sex', 'address', 'parent A halo', 'parent Z halo', 'username', 'display image', 'status', 'userId', 'shipping address', 'create halo range'].map(step => (
            <button
              key={step}
              onClick={() => handleCheckpointClick(step)}
              style={{
                background: 'transparent',
                color: '#39ff14',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* Active Profile Message */}
      {profileStatus === "active" && (
        <div style={{ color: "#0af", textAlign: "center", fontSize: "1.2rem", marginTop: '2rem' }}>
          ✅ Welcome, {user?.email || "User"}. You're already onboarded.
        </div>
      )}
    </div>
  );
}
