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
  const nonEditableFields = ["halo_id", "user_id"];

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

        if (!udata?.preferred_flow) updates.preferred_flow = "arc";

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.from("users").update(updates).eq("id", user.id);
          if (!error) udata = { ...udata, ...updates };
        }

        const { data: halo, error: haloError } = await supabase.from("halo_profiles").select("*").eq("user_id", user.id).single();
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
      const { error: haloError } = await supabase.from("halo_profiles").upsert({ user_id: user.id, halo_id: newHaloId }, { onConflict: "user_id" });
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
    if (!currentField || !user || nonEditableFields.includes(currentField)) return;
    const update = { [currentField]: fieldValue };
    const table = arcFields.includes(currentField) ? "halo_profiles" : "users";
    const key = table === "halo_profiles" ? "user_id" : "id";

    // Insert audit
    await supabase.from("onboarding_audit").insert({
      user_id: user.id,
      field_name: currentField,
      new_value: fieldValue,
      flow_type: userFlow
    });

    const { error } = await supabase.from(table).update(update).eq(key, user.id);
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
      <div style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", overflow: "hidden", zIndex: 0 }}>
        <video src={videoUrl || DEFAULT_VIDEO} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.16 }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, padding: "2rem" }}>
        <h1 style={{ textAlign: "center", fontSize: "1.8rem", color: "#39ff14" }}>
          {userFlow === "arc" ? "ArcSession Onboarding" : "Business Onboarding"}
        </h1>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button onClick={() => setUserFlow("arc")} style={{ marginRight: 10 }}>ArcSession</button>
          <button onClick={() => setUserFlow("business")}>Business</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "2rem" }}>
          {currentFields.map((field, index) => (
            <motion.div key={field} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <button
                onClick={() => !nonEditableFields.includes(field) && setEditingFieldIndex(index)}
                style={{ background: editingFieldIndex === index ? "#0af" : "#111", color: "#39ff14", padding: "10px 16px", borderRadius: 10, border: "1px solid #39ff14", minWidth: 160 }}>
                {field}: {userData?.[field] || (nonEditableFields.includes(field) ? "🔒" : "(edit)")}
              </button>
            </motion.div>
          ))}
        </div>

        {editingFieldIndex !== null && (
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <input
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder={`Enter ${currentField}`}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #39ff14", width: 260, marginRight: 12 }}
            />
            <button
              onClick={handleSaveField}
              style={{ padding: "10px 16px", borderRadius: 8, background: "#1b2", color: "#fff", fontWeight: 700 }}
            >
              Save
            </button>
          </div>
        )}

        {!haloExists && userFlow === "arc" && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={handleGenerateHalo}
              style={{ padding: "12px 20px", background: "#39ff14", color: "#000", fontWeight: 700, borderRadius: 12 }}
            >
              Generate Halo Arc
            </button>
          </div>
        )}

        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: "center", color: "#39ff14", marginTop: 20 }}>
            {saveMessage}
          </motion.div>
        )}

        {/* Additional restored content like Map, WalletPanel, etc., can be added here */}
      </div>
    </div>
  );
}
