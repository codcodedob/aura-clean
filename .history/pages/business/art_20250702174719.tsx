// pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
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

        const { data: halo, error: haloError } = await supabase.from("halo").select("*").eq("user_id", user.id).single();
        if (!haloError && halo?.halo_id) {
          setHaloExists(true);
          udata = { ...udata, ...halo };
        }

        setUserData(udata || {});
        setUserFlow(udata?.preferred_flow || "arc");
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

  const handleSaveField = async () => {
    if (!currentField || !user) return;
    const update = { [currentField]: fieldValue };
    const table = arcFields.includes(currentField) ? "halo" : "users";
    const { error } = await supabase.from(table).update(update).eq("user_id", user.id);
    if (!error) {
      setUserData(prev => ({ ...prev, ...update }));
      setSaveMessage("✅ Saved");
    } else {
      console.error("Save failed:", error);
      setSaveMessage("❌ Save failed");
    }
    setEditingFieldIndex(null);
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", background: "#000" }}>
      <h1 style={{ textAlign: "center" }}>{userFlow === "arc" ? "ArcSession Onboarding" : "Business Onboarding"}</h1>
      <p style={{ textAlign: "center", fontSize: 18 }}>
        Progress: {Math.floor((currentFields.filter(f => userData[f]).length / currentFields.length) * 100)}%
      </p>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => setUserFlow("arc")} style={{ marginRight: 10 }}>ArcSession</button>
        <button onClick={() => setUserFlow("business")}>Business</button>
      </div>

      {!haloExists && userFlow === "arc" && (
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

      {/* Stepper UI */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", margin: 20 }}>
        {currentFields.map((field, index) => (
          <motion.button
            key={field}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setEditingFieldIndex(index);
              setFieldValue(userData[field] || "");
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "2px solid #39ff14",
              background: userData[field] ? "#1a1a1a" : "transparent",
              color: userData[field] ? "#39ff14" : "#aaa",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {userData[field] ? `✔ ${field}` : field}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {editingFieldIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ background: "#111", padding: 20, borderRadius: 10, width: "100%", maxWidth: 420, margin: "0 auto" }}
          >
            <h3>Edit {currentField}</h3>
            <input
              value={fieldValue}
              onChange={e => setFieldValue(e.target.value)}
              style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6 }}
            />
            <button onClick={handleSaveField} style={{ background: "#39ff14", color: "#000", padding: "8px 14px", fontWeight: 600, borderRadius: 8 }}>Save</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Full Width */}
      <div style={{ height: "40vh", width: "100vw", zIndex: 1 }}>
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

      {/* Fam Awards */}
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#39ff14" }}>FAM Awards</h2>
        <div style={{ display: "flex", overflowX: "auto", gap: 12 }}>
          {(famAwards.length === 0 ? [{ id: 'demo', title: 'Demo Award', img_url: '/awards/artist1.jpg', winner: 'Demo' }] : famAwards).map(a => (
            <div key={a.id} style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160 }}>
              <img src={a.img_url} style={{ width: "100%", borderRadius: 6 }} />
              <div style={{ fontSize: 13, color: "#eee", marginTop: 4 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>Winner: {a.winner}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Tickets */}
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#39ff14" }}>Live Tickets</h2>
        <div style={{ display: "flex", overflowX: "auto", gap: 12 }}>
          {liveTickets.map(t => (
            <div key={t.id} style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160, cursor: "pointer" }} onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}>
              {showQR[t.id] ? (
                <>
                  <QRCode value={t.id} size={100} bgColor="#000" fgColor="#39ff14" />
                  <div style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>Tap to hide QR</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.event}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{t.date} · {t.venue}</div>
                  <div style={{ fontSize: 11, color: "#fecf2f" }}>Seat: {t.seat}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* IdeaFlight Panel */}
      <div style={{ padding: 24 }}>
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
