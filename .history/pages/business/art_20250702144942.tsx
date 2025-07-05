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
      {/* Top Navigation */}
      <nav style={{
        display: 'flex',
        flexDirection: windowWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: '#111',
        color: '#39ff14',
        borderBottom: '1px solid #222',
        gap: windowWidth < 768 ? '1rem' : 0
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.4rem' }}>Dobe System</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setUserRole("business")}>Business</button>
          <button onClick={() => setUserRole("arc")}>ArcSession</button>
          <button onClick={() => setProfileStatus("onboarding")}>Onboarding</button>
          <button onClick={() => setProfileStatus("active")}>Active</button>
        </div>
      </nav>

      {/* Onboarding Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem 1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {profileStatus === "onboarding" && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '2rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              overflowX: 'auto',
              padding: '1rem 0',
              gap: '4rem'
            }}>
              {userRole === "business" && (
                <div style={{ minWidth: '600px' }}>
                  <h1 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem' }}>Business Onboarding Flow</h1>
                  <BusinessOnboardingFlow onStepClick={handleCheckpointClick} />
                </div>
              )}

              {userRole === "arc" && (
                <div style={{ minWidth: '600px' }}>
                  <h1 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem' }}>Arc Session Onboarding Flow</h1>
                  <ArcSessionOnboardingFlow onStepClick={handleCheckpointClick} />
                </div>
              )}
            </div>
          </div>
        )}

        {profileStatus === "active" && (
          <div style={{ color: "#0af", textAlign: "center", fontSize: "1.2rem" }}>
            ✅ Welcome, {user?.email || "User"}. You're already onboarded.
          </div>
        )}
      </main>
    </div>
  );
}
