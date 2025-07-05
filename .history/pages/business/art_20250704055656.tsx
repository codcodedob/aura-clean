// pages/business/art.tsx

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

export default function ArtDepartmentPage() {
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

  useEffect(() => {
    const flow = router.query.flow as "business" | "arc";
    if (flow) setUserFlow(flow);

    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();
      const u = authData?.user;
      if (!u) return;
      setUser(u);

      let { data: udata } = await supabase.from("users").select("*").eq("id", u.id).single();
      const updates: any = {};
      if (!udata?.account_created) updates.account_created = true;
      if (!udata?.email && u.email) updates.email = u.email;
      if (!udata?.user_id) updates.user_id = u.id;

      if (Object.keys(updates).length) {
        await supabase.from("users").update(updates).eq("id", u.id);
        udata = { ...udata, ...updates };
      }

      const { data: halo } = await supabase.from("halo_profiles").select("*").eq("user_id", u.id).single();
      if (halo?.halo_id) {
        setHaloExists(true);
        udata = { ...udata, ...halo };
      }

      const { data: business } = await supabase.from("business_profiles").select("*").eq("user_id", u.id).single();
      if (business) udata = { ...udata, ...business };

      setUserData(udata || {});

      const { data: s } = await supabase.from("settings").select("value").eq("key", "videourl").single();
      setVideoUrl(s?.value || DEFAULT_VIDEO);

      const { data: fa } = await supabase.from("fam_awards").select("*").order("year", { ascending: false });
      setFamAwards(fa || []);

      const { data: lt } = await supabase.from("tickets").select("*");
      setLiveTickets(lt || []);
    }

    loadData();
  }, [router.query.flow]);

  const handleSaveField = async () => {
    if (!currentField || !user) return;
    const update = { [currentField]: fieldValue };
    const table = arcFields.includes(currentField) ? "halo_profiles" : "business_profiles";
    const { error } = await supabase.from(table).update(update).eq("user_id", user.id);
    if (!error) setUserData(prev => ({ ...prev, ...update })) && setSaveMessage("✅ Saved");
    else setSaveMessage("❌ Save failed");
    setEditingFieldIndex(null);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleStepClick = (field: string, idx: number) => {
    if (field === "account_created") setShowAuthModal(true);
    else if (field === "art_role") {
      setCustomModalContent(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3>Your Business Name & Role</h3>
          <input placeholder="Business Name" value={userData.business_name || ''}
            onChange={e => setUserData((d:any)=>({ ...d, business_name: e.target.value }))}
            style={{ padding:8, borderRadius:6, border:'1px solid #444' }} />
          <input placeholder="Role" value={userData.business_role || ''}
            onChange={e => setUserData((d:any)=>({ ...d, business_role: e.target.value }))}
            style={{ padding:8, borderRadius:6, border:'1px solid #444' }} />
          <button style={{ background:'#39ff14', padding:8, borderRadius:6 }} onClick={()=>setShowCustomModal(false)}>Save</button>
        </div>
      );
      setShowCustomModal(true);
    }
    else if (field === "portfolio") {
      setCustomModalContent(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3>Target Areas</h3>
          <textarea placeholder="Describe services..." value={userData.portfolio || ''}
            onChange={e => setUserData((d:any)=>({ ...d, portfolio: e.target.value }))}
            style={{ padding:8, borderRadius:6, border:'1px solid #444', minHeight:60 }} />
          <button style={{ background:'#39ff14', padding:8, borderRadius:6 }} onClick={()=>setShowCustomModal(false)}>Save</button>
        </div>
      );
      setShowCustomModal(true);
    }
    else if (field === 'wallet') {
      setCustomModalContent(
        <div style={{ display:'flex', gap:12 }}>
          <button style={{ padding:8, background:'#1a1a1a', color:'#39ff14', borderRadius:6 }}>Connect Stripe</button>
          <button style={{ padding:8, background:'#1a1a1a', color:'#39ff14', borderRadius:6 }}>WalletConnect</button>
        </div>
      );
      setShowCustomModal(true);
    }
    else if (!nonEditableFields.includes(field)) {
      setEditingFieldIndex(idx);
      setFieldValue(userData[field] || '');
    }
    else if (field === 'artgang') router.push('/artgang');
  };

  const mapCenter = { lat:40.748817, lng:-73.985428 };
  const departments = [
    'art','entertainment','cuisine','fashion','health_n_fitness','science','community_clipboard'
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff' }}>
      <h1 style={{ textAlign:'center', margin:16 }}>
        {userFlow==='arc'? 'ArcSession Onboarding':'Business Onboarding'}
      </h1>
      <p style={{ textAlign:'center', fontSize:18 }}>
        Progress: {Math.floor((currentFields.filter(f=>userData[f]).length/currentFields.length)*100)}%
      </p>

      {departments.map((d)=>(
        <div key={d} style={{ padding:24 }}>
          <h2 style={{ color:'#39ff14', textAlign:'center', textTransform:'capitalize' }}>{d.replace(/_/g,' ')}</h2>
          <BusinessCarousel department={d} aiPick={false} />
        </div>
      ))}

      <div style={{ display:'flex', justifyContent:'center', gap:16, margin:20 }}>
        <button onClick={()=>setUserFlow('arc')}>ArcSession</button>
        <button onClick={()=>setUserFlow('business')}>Business</button>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center' }}> 
        {currentFields.map((f,i)=>(
          <motion.div key={f} whileHover={{ scale:1.05 }}
            style={{ position:'relative', minWidth:100 }}
            onMouseEnter={()=>setTooltipIndex(i)} onMouseLeave={()=>setTooltipIndex(null)}>
            <motion.button onClick={()=>handleStepClick(f,i)}
              style={{
                padding:'10px 14px', borderRadius:8, border:'none',
                background:userData[f]?'#1a1a1a':'transparent',
                color:userData[f]?'#39ff14':'#ff4d4d',
                textDecoration:userData[f]?'underline 3px #39ff14':'underline 1px #ff4d4d',
                fontWeight:600
              }}>
              {userData[f]?`✔ ${f}`:f}
            </motion.button>
            {tooltipIndex===i && (
              <div style={{
                position:'absolute', top:'100%', left:0, marginTop:4,
                background:'#222', color:'#fff', padding:6, borderRadius:6, fontSize:13, whiteSpace:'nowrap'
              }}>{tooltips[f]||''}</div>
            )}
          </motion.div>
        ))}
      </div>

      {showAuthModal && <AuthForm onClose={()=>setShowAuthModal(false)} />}
      {showCustomModal && (
        <div style={{
          position:'fixed', top:'20%', left:0, right:0, margin:'auto',
          background:'#111', padding:24, borderRadius:12, zIndex:1000, maxWidth:400
        }}>
          {customModalContent}
          <button style={{ marginTop:12, padding:8 }} onClick={()=>setShowCustomModal(false)}>Close</button>
        </div>
      )}

      <AnimatePresence>
        {editingFieldIndex!==null && (
          <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-20 }}
            style={{ background:'#111', padding:20, borderRadius:10, maxWidth:420, margin:'20px auto' }}>
            <h3>Edit {currentField}</h3>
            <input value={fieldValue} onChange={e=>setFieldValue(e.target.value)}
              style={{ width:'100%', padding:10, margin:'10px 0', borderRadius:6, border:'1px solid #444' }} />
            <button onClick={handleSaveField} style={{ background:'#39ff14', padding:10, borderRadius:6 }}>Save</button>
          </motion.div>
        )}
      </AnimatePresence>

      {timesTableVisible && (
        <div style={{ padding:24 }}>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}
            style={{ background:'#181f1b', padding:16, borderRadius:12 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'#39ff14', marginBottom:6 }}>Times Table</div>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:10, borderRadius:10, background:'#1b2', color:'#fff' }}>Make Time</button>
              <button style={{ flex:1, padding:10, borderRadius:10, border:'2px solid #39ff14', background:'transparent', color:'#39ff14' }}>Sync</button>
            </div>
          </motion.div>
        </div>
      )}

      <div style={{ height:'40vh', width:'100vw' }}>
        <GoogleMapReact bootstrapURLKeys={{ key:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY||"" }} defaultCenter={mapCenter} defaultZoom={11}>
          <div style={{ position:'absolute', transform:'translate(-50%,-50%)' }}><span style={{ background:'#39ff14', borderRadius:'50%', padding:8, color:'#191c24' }}>◎</span></div>
        </GoogleMapReact>
      </div>

      <div style={{ padding:24 }}>  {/* Fam Awards */}
        <h2 style={{ color:'#39ff14' }}>FAM Awards</h2>
        <div style={{ display:'flex', overflowX:'auto', gap:12 }}>
          {famAwards.length? famAwards: [{ id:'demo', title:'Demo Award', img_url:'/awards/artist1.jpg', winner:'Demo' }]}
        </div>
      </div>

      <div style={{ padding:24 }}>  {/* Live Tickets */}
        <h2 style={{ color:'#39ff14' }}>Live Tickets</h2>
        <div style={{ display:'flex', overflowX:'auto', gap:12 }}>
          {liveTickets.map(t=>(
            <div key={t.id} onClick={()=>setShowQR(prev=>({...prev,[t.id]:!prev[t.id]}))}
                 style={{ background:'#101314', padding:10, borderRadius:10, minWidth:160, cursor:'pointer' }}>
              {showQR[t.id]? <QRCode value={t.id} size={100} fgColor="#39ff14" />:<>
                <div style={{ fontWeight:700, marginBottom:4 }}>{t.event}</div>
                <div style={{ fontSize:12 }}>{t.date}·{t.venue}</div>
                <div style={{ color:'#fecf2f' }}>Seat:{t.seat}</div>
              </>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:24 }}>  {/* IdeaFlight */}
        <div style={{ background:'#181f1b', padding:16, borderRadius:12 }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#39ff14', marginBottom:6 }}>IdeaFlight</div>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ flex:1, padding:10, borderRadius:10, background:'#1b2', color:'#fff' }}>Create</button>
            <button style={{ flex:1, padding:10, borderRadius:10, background:'transparent', border:'2px solid #39ff14', color:'#39ff14' }} onClick={()=>router.push('/space')}>Go to Space</button>
          </div>
        </div>
      </div>
    </div>
  );
}
