// pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import AuthForm from "@/components/AuthForm";
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customModalContent, setCustomModalContent] = useState<React.ReactNode>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [timesTableVisible, setTimesTableVisible] = useState(true);
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
  const nonEditableFields = ["halo_id", "user_id", "artgang"];

  useEffect(() => {
    const initialFlow = router.query.flow as "business" | "arc";
    if (initialFlow) setUserFlow(initialFlow);

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

        const { data: halo } = await supabase.from("halo_profiles").select("*").eq("user_id", user.id).single();
        if (halo?.halo_id) {
          setHaloExists(true);
          udata = { ...udata, ...halo };
        }

        const { data: business } = await supabase.from("business_profiles").select("*").eq("user_id", user.id).single();
        if (business) {
          udata = { ...udata, ...business };
        }

        setUserData(udata || {});
      }
    };

    fetchUser();

    supabase.from("settings").select("value").eq("key", "videourl").single().then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));
    supabase.from("fam_awards").select("*").order("year", { ascending: false }).then(({ data }) => setFamAwards(data || []));
    supabase.from("tickets").select("*").then(({ data }) => setLiveTickets(data || []));
  }, [router.query.flow]);

  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", background: "#000" }}>
      <h1 style={{ textAlign: "center" }}>{userFlow === "arc" ? "ArcSession Onboarding" : "Business Onboarding"}</h1>
      <p style={{ textAlign: "center", fontSize: 18 }}>
        Progress: {Math.floor((currentFields.filter(f => userData[f]).length / currentFields.length) * 100)}%
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
        <button onClick={() => setUserFlow("arc")}>ArcSession</button>
        <button onClick={() => setUserFlow("business")}>Business</button>
      </div>

      {timesTableVisible && (
        <div style={{ padding: 24 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>Times Table</div>
            <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>View and manage availability</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10 }}>Make Time</button>
              <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700 }}>Sync</button>
            </div>
          </motion.div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", margin: 20 }}>
        {currentFields.map((field, index) => (
          <motion.div key={field} whileHover={{ scale: 1.06 }} style={{ position: "relative" }}>
            <motion.button
              onClick={() => {
                if (field === "account_created") {
                  setShowAuthModal(true);
                } else if (field === "art_role") {
                  setCustomModalContent(<div><h3>Your Business Name & Role</h3><input placeholder="Name" /><input placeholder="Role" /></div>);
                  setShowCustomModal(true);
                } else if (field === "portfolio") {
                  setCustomModalContent(<div><h3>Target Areas</h3><textarea placeholder="Describe your services" /></div>);
                  setShowCustomModal(true);
                } else if (field === "wallet") {
                  setCustomModalContent(<div><h3>Connect Wallet</h3><button>Connect via Stripe</button><button>WalletConnect</button></div>);
                  setShowCustomModal(true);
                } else if (!nonEditableFields.includes(field)) {
                  setEditingFieldIndex(index);
                  setFieldValue(userData[field] || "");
                } else if (field === "artgang") {
                  router.push("/artgang");
                }
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: userData[field] ? "#1a1a1a" : "transparent",
                color: userData[field] ? "#39ff14" : "#ff4d4d",
                fontWeight: 600,
                border: "none"
              }}
            >
              {userData[field] ? `✔ ${field}` : field}
            </motion.button>
            <div style={{ position: "absolute", bottom: -20, width: "100%", textAlign: "center", fontSize: 11, color: "#aaa" }}>
              {field === "account_created" ? "Log in to get started" :
               field === "wallet" ? "Connect card or wallet" :
               field === "portfolio" ? "Describe services" :
               field === "artgang" ? "Finish & Go Public" :
               "Click to fill"}
            </div>
          </motion.div>
        ))}
      </div>

      {showAuthModal && <AuthForm onClose={() => setShowAuthModal(false)} />}
      {showCustomModal && (
        <div style={{ background: "#111", padding: 24, borderRadius: 12, maxWidth: 420, margin: "0 auto" }}>
          {customModalContent}
          <button onClick={() => setShowCustomModal(false)} style={{ marginTop: 10 }}>Close</button>
        </div>
      )}

      {/* Future restore of IdeaFlight, Map, QR, FAM Awards, etc. */}
    </div>
  );
}
