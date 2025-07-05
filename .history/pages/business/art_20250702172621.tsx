a// pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

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
  const [fieldValue, setFieldValue] = useState<any>("");
  const [userFlow, setUserFlow] = useState<"business" | "arc">("arc");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [haloExists, setHaloExists] = useState<boolean>(false);
  const router = useRouter();

  const arcFields = [
    "halo_id", "birthday", "age", "sex", "address",
    "parent_a_halo", "parent_z_halo", "username",
    "display_image", "user_id", "shipping_address", "halo_range"
  ];

  const businessFields = [
    "account_created", "art_role", "portfolio", "wallet", "verification", "artgang"
  ];

  const currentFields = userFlow === "arc" ? arcFields : businessFields;
  const currentField = editingFieldIndex !== null ? currentFields[editingFieldIndex] : null;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        setUser(user);
        let { data: udata } = await supabase.from("users").select("*").eq("id", user.id).single();
        const updates: any = {};

        if (!udata?.account_created) updates.account_created = true;
        if (!udata?.email && user.email) updates.email = user.email;
        if (!udata?.user_id) updates.user_id = user.id;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.from("users").update(updates).eq("id", user.id);
          if (!error) udata = { ...udata, ...updates };
        }

        setUserData(udata || {});
        setUserFlow(udata?.preferred_flow || "arc");

        const { data: halo, error: haloError } = await supabase.from("halo").select("halo_id").eq("user_id", user.id).single();
        if (!haloError && halo?.halo_id) {
          setHaloExists(true);
        }
      }
    };

    fetchUser();

    supabase.from("settings").select("value").eq("key", "videourl").single().then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));
    supabase.from("fam_awards").select("*").order("year", { ascending: false }).then(({ data }) => setFamAwards(data || []));
    supabase.from("tickets").select("*").then(({ data }) => setLiveTickets(data || []));
  }, []);

  const handleGenerateHalo = async () => {
    if (!user || haloExists) return;
    const newHaloId = `halo_${uuidv4()}`;
    const { error: userError } = await supabase.from("users").update({ halo_id: newHaloId }).eq("id", user.id);
    if (!userError) {
      const { error: haloError } = await supabase.from("halo").upsert({ user_id: user.id, halo_id: newHaloId }, { onConflict: "user_id" });
      if (!haloError) {
        setUserData(prev => ({ ...prev, halo_id: newHaloId }));
        setHaloExists(true);
        setSaveMessage("🛸 Halo Arc generated!");
      } else {
        console.error("Halo table update failed:", haloError);
        setSaveMessage("❌ Halo table update failed");
      }
    } else {
      console.error("User table update failed:", userError);
      setSaveMessage("❌ User table update failed");
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", background: "#000" }}>
      <h1 style={{ textAlign: "center" }}>ArcSession Onboarding</h1>
      <p style={{ textAlign: "center", fontSize: 18 }}>
        Progress: {Math.floor((arcFields.filter(f => userData[f]).length / arcFields.length) * 100)}%
      </p>

      {!haloExists && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={handleGenerateHalo}
            style={{ background: "#39ff14", color: "black", padding: "10px 20px", fontWeight: 700, borderRadius: 8 }}
          >
            Generate Halo Arc
          </button>
        </div>
      )}

      {saveMessage && <p style={{ textAlign: "center", marginTop: 10 }}>{saveMessage}</p>}

      {/* IdeaFlight Panel */}
      <div style={{ marginTop: 60, padding: 24 }}>
        <div style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>IdeaFlight</div>
          <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>Plan and launch new initiatives</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10 }}>Create</button>
            <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700 }}>Go to Space</button>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div style={{ padding: 24, background: "#111" }}>
        <WalletPanel />
      </div>
    </div>
  );
}
