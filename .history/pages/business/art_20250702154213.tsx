// pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { motion } from "framer-motion";

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });

const DEFAULT_VIDEO = "/bg/default-art.mp4";

export default function ArtBusinessPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>({});
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [userFlow, setUserFlow] = useState<"business" | "arc">("arc");

  const router = useRouter();

  const arcFields = [
    "halo_id", "birthday", "age", "sex", "address",
    "parent_a_halo", "parent_z_halo", "username",
    "display_image", "user_id", "shipping_address", "halo_range"
  ];

  const businessFields = [
    "account_created", "profile_completed", "art_role", "portfolio", "wallet", "verification", "artgang"
  ];

  const currentFields = userFlow === "arc" ? arcFields : businessFields;
  const currentField = editingFieldIndex !== null ? currentFields[editingFieldIndex] : null;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      if (data?.user) {
        supabase.from("users").select("*").eq("id", data.user.id).single().then(({ data }) => {
          setUserData(data || {});
          setUserFlow(data?.preferred_flow || "arc");
        });
      }
    });

    supabase.from("settings").select("value").eq("key", "videourl").single().then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));
    supabase.from("fam_awards").select("*").order("year", { ascending: false }).then(({ data }) => setFamAwards(data || []));
    supabase.from("tickets").select("*").then(({ data }) => setLiveTickets(data || []));
  }, []);

  const calculateStatus = () => {
    const filledFields = currentFields.filter(f => userData[f]);
    if (filledFields.length === currentFields.length) return "active";
    if (filledFields.length > 0) return "in progress";
    return "onboarding";
  };

  const handleSubmitField = async () => {
    if (!user || editingFieldIndex === null) return;
    const field = currentFields[editingFieldIndex];
    const updated = { ...userData, [field]: fieldValue };
    const status = calculateStatus();
    const { error } = await supabase.from("users").update({ ...updated, status }).eq("id", user.id);
    if (!error) {
      setUserData(updated);
      setFieldValue("");
      const nextIndex = editingFieldIndex + 1;
      if (nextIndex < currentFields.length) {
        setEditingFieldIndex(nextIndex);
        setFieldValue(updated[currentFields[nextIndex]] || "");
      } else {
        setEditingFieldIndex(null);
      }
    }
  };

  const progressPercentage = Math.floor((currentFields.filter(f => userData[f]).length / currentFields.length) * 100);
  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      <video
        src={videoUrl || DEFAULT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", objectFit: "cover", zIndex: 0, opacity: 0.16, pointerEvents: "none", background: "#000" }}
      />

      <div style={{ position: 'sticky', top: 0, background: '#111', zIndex: 5, borderBottom: '1px solid #222' }}>
        <div style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: '#39ff14', fontWeight: 700 }}>
          Status: {calculateStatus().toUpperCase()} ({progressPercentage}%)
          <button
            onClick={() => setUserFlow(userFlow === "arc" ? "business" : "arc")}
            style={{ marginLeft: '1rem', fontSize: '0.8rem', background: '#222', color: '#0af', padding: '0.25rem 0.5rem', border: 'none', borderRadius: 4 }}>
            Switch to {userFlow === "arc" ? "Business" : "ArcSession"}
          </button>
        </div>
        <div style={{ height: 6, width: '100%', background: '#333' }}>
          <div style={{ height: '100%', width: `${progressPercentage}%`, background: '#39ff14', transition: 'width 0.3s ease-in-out' }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '1rem', gap: '1.5rem' }}>
          {currentFields.map((field, index) => (
            <motion.button
              key={field}
              onClick={() => {
                setEditingFieldIndex(index);
                setFieldValue(userData[field] || "");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'transparent', color: userData?.[field] ? '#0af' : '#ff4d4d', border: 'none', fontSize: '1rem', fontWeight: 700, borderBottom: '2px solid #444', padding: '0.5rem 1rem' }}
            >
              {userData?.[field] ? `✓ ${field}` : `${field} (❗)`}
            </motion.button>
          ))}
          <motion.button
            onClick={() => router.push("/artgang")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginLeft: '1rem', background: '#222', color: '#39ff14', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, fontSize: '1rem', boxShadow: '0 1px 8px #39ff1450' }}
          >
            artgang→
          </motion.button>
        </div>

        {editingFieldIndex !== null && (
          <div style={{ padding: '1rem', background: '#191919', textAlign: 'center' }}>
            <input
              value={fieldValue}
              onChange={e => setFieldValue(e.target.value)}
              placeholder={`Enter ${currentField}`}
              style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #444', width: '60%', marginRight: '1rem' }}
            />
            <button
              onClick={handleSubmitField}
              style={{ padding: '0.5rem 1rem', background: '#39ff14', color: '#000', border: 'none', borderRadius: 6, fontWeight: 700 }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div style={{ height: "50vh", width: "100vw", zIndex: 1 }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" }}
          defaultCenter={mapCenter}
          defaultZoom={11}
        >
          <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)' }}>
            <span style={{ background: "#39ff14", color: "#191c24", borderRadius: "50%", padding: 8, fontWeight: 700 }}>◎</span>
          </div>
        </GoogleMapReact>
      </div>

      <div style={{ padding: 24, background: "#111" }}>
        <WalletPanel />
      </div>
    </div>
  );
}
