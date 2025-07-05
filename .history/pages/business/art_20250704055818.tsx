// pages/business/art.tsx or pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import AuthForm from "@/components/AuthForm";
import BusinessCarousel from "@/components/BusinessCarousel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });
const DEFAULT_VIDEO = "/bg/default-art.mp4";

export default function ArtBusinessPage() {
  // State
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
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const router = useRouter();

  // Step fields
  const arcFields = [
    "halo_id", "birthday", "age", "sex", "address",
    "parent_a_halo", "parent_z_halo", "username",
    "display_image", "user_id", "shipping_address", "halo_range"
  ];

  const businessFields = [
    "account_created", "art_role", "portfolio", "wallet", "verification", "artgang"
  ];

  const tooltips: Record<string, string> = {
    account_created: "Log in to get started",
    art_role: "Enter your business name and role",
    portfolio: "Describe services you want or provide",
    wallet: "Connect card or wallet",
    verification: "Check or update your verification status",
    artgang: "Finish onboarding & go public"
  };

  const currentFields = userFlow === "arc" ? arcFields : businessFields;
  const currentField = editingFieldIndex !== null ? currentFields[editingFieldIndex] : null;
  const nonEditableFields = ["halo_id", "user_id", "artgang"];

  // Data load
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
        // Pull extra profile tables
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

  // Save fields
  const handleSaveField = async () => {
    if (!currentField || !user) return;
    const update = { [currentField]: fieldValue };
    const table = arcFields.includes(currentField) ? "halo_profiles" : "business_profiles";
    const { error } = await supabase.from(table).update(update).eq("user_id", user.id);
    if (!error) {
      setUserData(prev => ({ ...prev, ...update }));
      setSaveMessage("✅ Saved");
    } else {
      console.error("Save failed:", error);
      setSaveMessage("❌ Save failed");
    }
    setEditingFieldIndex(null);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  // Step modals
  const handleStepClick = (field: string, index: number) => {
    if (field === "account_created") setShowAuthModal(true);
    else if (field === "art_role") {
      setCustomModalContent(
        <div>
          <h3>Your Business Name & Role</h3>
          <input
            placeholder="Business Name"
            value={userData.business_name || ""}
            onChange={e => setUserData((d: any) => ({ ...d, business_name: e.target.value }))}
            style={{ marginBottom: 8, width: "100%", padding: 8 }}
          />
          <input
            placeholder="Role"
            value={userData.business_role || ""}
            onChange={e => setUserData((d: any) => ({ ...d, business_role: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
          <button style={{ marginTop: 10, background: "#39ff14" }} onClick={() => setShowCustomModal(false)}>Save</button>
        </div>
      );
      setShowCustomModal(true);
    }
    else if (field === "portfolio") {
      setCustomModalContent(
        <div>
          <h3>Target Areas</h3>
          <textarea
            placeholder="What do you want from Dobe or provide?"
            value={userData.portfolio || ""}
            onChange={e => setUserData((d: any) => ({ ...d, portfolio: e.target.value }))}
            style={{ width: "100%", padding: 8, minHeight: 64 }}
          />
          <button style={{ marginTop: 10, background: "#39ff14" }} onClick={() => setShowCustomModal(false)}>Save</button>
        </div>
      );
      setShowCustomModal(true);
    }
    else if (field === "wallet") {
      setCustomModalContent(
        <div>
          <h3>Connect Wallet</h3>
          <button style={{ marginRight: 12 }}>Connect Stripe</button>
          <button>WalletConnect</button>
        </div>
      );
      setShowCustomModal(true);
    }
    else if (!nonEditableFields.includes(field)) {
      setEditingFieldIndex(index);
      setFieldValue(userData[field] || "");
    } else if (field === "artgang") {
      router.push("/artgang");
    }
  };

  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  // UI
  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", background: "#000" }}>
      <h1 style={{ textAlign: "center" }}>
        {userFlow === "arc" ? "ArcSession Onboarding" : "Business Onboarding"}
      </h1>
      <p style={{ textAlign: "center", fontSize: 18 }}>
        Progress: {Math.floor((currentFields.filter(f => userData[f]).length / currentFields.length) * 100)}%
      </p>

      {/* Art Department Carousel from Supabase */}
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#39ff14", textAlign: "center" }}>Featured Art Department</h2>
        {/* FIX: Provide department prop */}
        <BusinessCarousel department="art" />
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
        <button onClick={() => setUserFlow("arc")}>ArcSession</button>
        <button onClick={() => setUserFlow("business")}>Business</button>
      </div>

      {/* Step Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", margin: 20 }}>
        {currentFields.map((field, index) => (
          <motion.div
            key={field}
            whileHover={{ scale: 1.06 }}
            style={{ position: "relative", minWidth: 100 }}
            onMouseEnter={() => setTooltipIndex(index)}
            onMouseLeave={() => setTooltipIndex(null)}
          >
            <motion.button
              onClick={() => handleStepClick(field, index)}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: userData[field] ? "#1a1a1a" : "transparent",
                color: userData[field] ? "#39ff14" : "#ff4d4d",
                fontWeight: 600,
                border: "none",
                textDecoration: userData[field] ? "underline 3px #39ff14" : "underline 1px #ff4d4d"
              }}
            >
              {userData[field] ? `✔ ${field}` : field}
            </motion.button>
            {tooltipIndex === index && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "#222",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 13,
                zIndex: 10,
                whiteSpace: "nowrap",
                marginTop: 4
              }}>
                {tooltips[field] || ""}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {showAuthModal && <AuthForm onClose={() => setShowAuthModal(false)} />}
      {showCustomModal && (
        <div style={{
          background: "#111", padding: 24, borderRadius: 12, maxWidth: 420, margin: "0 auto",
          position: "fixed", top: "30%", left: 0, right: 0, zIndex: 999
        }}>
          {customModalContent}
          {/* Save handled inline in modal content for now */}
          <button onClick={() => setShowCustomModal(false)} style={{ marginTop: 10 }}>Close</button>
        </div>
      )}

      {/* Animated Step Editor */}
      <AnimatePresence>
        {editingFieldIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: "#111", padding: 20, borderRadius: 10,
              width: "100%", maxWidth: 420, margin: "0 auto", marginBottom: 28
            }}
          >
            <h3>Edit {currentField}</h3>
            <input
              value={fieldValue}
              onChange={e => setFieldValue(e.target.value)}
              style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6 }}
            />
            <button
              onClick={handleSaveField}
              style={{ background: "#39ff14", color: "#000", padding: "8px 14px", fontWeight: 600, borderRadius: 8 }}
            >
              Save
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Times Table */}
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
            <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px Here's how to fix the `BusinessCarousel` prop error (and make sure your Art department card on `index.tsx` always pulls from Supabase):

---

### 1. **Check Your `BusinessCarousel` Component Signature**

If your file `/components/BusinessCarousel.tsx` looks like:

```tsx
type Props = {
  department: string;
  aiPick?: boolean;
};

export default function BusinessCarousel({ department, aiPick }: Props) {
  // ...implementation...
}
