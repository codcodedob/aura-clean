// pages/business/art.tsx
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import WalletPanel from '@/components/WalletPanel'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import AuthForm from '@/components/AuthForm'

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const onboardingArcFields = [
  'halo_id','birthday','age','sex','address',
  'parent_a_halo','parent_z_halo','username','display_image','shipping_address','halo_range'
]
const onboardingBizFields = [
  'account_created','art_role','portfolio','wallet_connected','verification','artgang'
]
const portfolioOptions = [
  'Artist Hosting','Simple Website','Custom App','Royalty Collection',
  'Prototyping','Manufacturing','Distribution','Consultation'
]

export default function BusinessArtPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>({})
  const [userFlow, setUserFlow] = useState<'arc'|'business'>('business')
  const [editingFieldIndex, setEditingFieldIndex] = useState<number|null>(null)
  const [fieldValue, setFieldValue] = useState<any>('')
  const [bizName, setBizName] = useState<string>('')
  const [bizRole, setBizRole] = useState<string>('')
  const [saveMessage, setSaveMessage] = useState<string|null>(null)
  const [famAwards, setFamAwards] = useState<any[]>([])
  const [liveTickets, setLiveTickets] = useState<any[]>([])
  const [showQR, setShowQR] = useState<{ [k:string]: boolean }>({})
  const [haloExists, setHaloExists] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  const fields = userFlow === 'arc' ? onboardingArcFields : onboardingBizFields
  const currentField = editingFieldIndex !== null ? fields[editingFieldIndex] : null
  
  const loadUserData = async () => {
    const { data: auth } = await supabase.auth.getUser()
    const u = auth?.user
    setUser(u)
    if (!u) return
    let { data: udata } = await supabase.from('users').select('*').eq('id', u.id).single()
    let merged = udata || {}
    const { data: halo } = await supabase.from('halo_profiles').select('*').eq('user_id', u.id).single()
    if (halo) {
      merged = { ...merged, ...halo }
      if (halo.halo_id) setHaloExists(true)
    }
    const { data: biz } = await supabase.from('business_profiles').select('*').eq('user_id', u.id).single()
    if (biz) merged = { ...merged, ...biz }
    setUserData(merged)
  }

  useEffect(() => {
    loadUserData()
    supabase.from('fam_awards').select('*').order('year',{ascending:false}).then(r=>setFamAwards(r.data||[]))
    supabase.from('tickets').select('*').then(r=>setLiveTickets(r.data||[]))
  }, [])

  const handleGenerateHalo = async () => {
    if (!user || haloExists) return
    const newId = `halo_${uuidv4()}`
    const { error } = await supabase.from('halo_profiles')
      .upsert({ user_id: user.id, halo_id: newId }, { onConflict: 'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, halo_id: newId }))
      setHaloExists(true)
      setSaveMessage('🛸 Halo generated!')
    } else {
      setSaveMessage('❌ Could not generate halo')
    }
    setTimeout(()=>setSaveMessage(null),3000)
  }

  const handleSaveField = async () => {
    if (editingFieldIndex===null || !user) return
    const field = fields[editingFieldIndex]
    const table = onboardingArcFields.includes(field) ? 'halo_profiles' : 'business_profiles'
    let update: any = { user_id: user.id }
    if (field === 'art_role') {
      update.business_name = bizName
      update.business_role = bizRole
    } else if (field === 'wallet_connected') {
      update.wallet_connected = fieldValue
    } else {
      update[field] = fieldValue
    }
    const { error } = await supabase.from(table).upsert(update, { onConflict:'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, ...update }))
      setSaveMessage('✅ Saved')
    } else {
      console.error(error)
      setSaveMessage('❌ Save failed')
    }
    setEditingFieldIndex(null)
    setTimeout(()=>setSaveMessage(null),2500)
  }

  const handleWalletConnect = async (method: string) => {
    if (!user) return
    const update = { user_id: user.id, wallet_connected: method }
    const { error } = await supabase.from('business_profiles').upsert(update, { onConflict:'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, wallet_connected: method }))
      setSaveMessage(`✅ Connected ${method}`)
    } else {
      setSaveMessage('❌ Connection failed')
    }
    setEditingFieldIndex(null)
    setTimeout(()=>setSaveMessage(null),2500)
  }

  const completed = fields.filter(f=>userData[f]!==undefined && userData[f]!==null && userData[f]!=='').length
  const progress = Math.floor((completed/fields.length)*100)

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', position:'relative' }}>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}
          >
            <div style={{background:'#111',padding:24,borderRadius:8, width:320}}>
              <AuthForm onAuth={async()=>{ setShowAuthModal(false); await loadUserData() }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow Toggle & Progress */}
      <div style={{ position:'sticky', top:0, background:'#111', padding:16, zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <button onClick={()=>setUserFlow('arc')} style={{ marginRight:12, color:userFlow==='arc'?'#39ff14':'#888' }}>ArcSession</button>
          <button onClick={()=>setUserFlow('business')} style={{ color:userFlow==='business'?'#39ff14':'#888' }}>Business</button>
        </div>
        <div style={{ height:8, background:'#333', borderRadius:4, overflow:'hidden' }}>
          <motion.div style={{ height:'100%', background:'#39ff14' }} animate={{ width:`${progress}%` }} transition={{ ease:'easeOut' }} />
        </div>
        <div style={{ textAlign:'center', marginTop:4 }}>{progress}% complete</div>
      </div>

      {/* Onboarding Stepper */}
      <div style={{ padding:16, display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
        {fields.map((f,i)=>(
          <motion.button key={f}
            whileHover={{ scale:1.05 }}
            onClick={()=>{
              if (f==='account_created' && !user) return setShowAuthModal(true)
              if (f==='artgang') return router.push('/agx-license')
              if (f==='art_role') {
                setBizName(userData.business_name||'')
                setBizRole(userData.business_role||'')
              }
              setEditingFieldIndex(i)
              setFieldValue(userData[f]|| '')
            }}
            style={{
              padding:'8px 12px', borderRadius:6, border:'none',
              background:userData[f]?'#1a1a1a':'transparent',
              color:userData[f]?'#39ff14':'#888', cursor:'pointer'
            }}
          >{userData[f]?`✔ ${f}`:f}</motion.button>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingFieldIndex!==null && (
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            style={{ background:'#111', padding:16, borderRadius:6, maxWidth:400, margin:'0 auto' }}>
            <h3>Edit {currentField}</h3>
            {currentField==='portfolio' ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12}}>
                {portfolioOptions.map(opt=>(
                  <label key={opt} style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <input type="checkbox" checked={Array.isArray(fieldValue)&&fieldValue.includes(opt)}
                      onChange={()=>{
                        const arr = Array.isArray(fieldValue)?[...fieldValue]:[]
                        const idx = arr.indexOf(opt)
                        if(idx>=0) arr.splice(idx,1)
                        else arr.push(opt)
                        setFieldValue(arr)
                      }}
                    />
                    <span style={{ color:'#eee' }}>{opt}</span>
                  </label>
                ))}
              </div>
            ) : currentField==='art_role' ? (
              <div style={{ marginBottom:12 }}>
                <input value={bizName} onChange={e=>setBizName(e.target.value)} placeholder="Business Name" style={{ width:'100%', padding:8, marginBottom:8, borderRadius:4 }} />
                <input value={bizRole} onChange={e=>setBizRole(e.target.value)} placeholder="Your Role" style={{ width:'100%', padding:8, borderRadius:4 }} />
              </div>
            ) : currentField==='wallet_connected' ? (
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <button onClick={()=>handleWalletConnect('stripe')} style={{ flex:1, padding:8, borderRadius:4, background:'#39ff14', color:'#000' }}>Stripe</button>
                <button onClick={()=>handleWalletConnect('paypal')} style={{ flex:1, padding:8, borderRadius:4, background:'#39ff14', color:'#000' }}>PayPal</button>
              </div>
            ) : (
              <input
                value={fieldValue}
                onChange={e=>setFieldValue(e.target.value)}
                style={{ width:'100%', padding:8, marginBottom:12, borderRadius:4 }}
              />
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleSaveField} style={{ flex:1, background:'#39ff14', color:'#000', padding:8, borderRadius:4 }}>Save</button>
              <button onClick={()=>setEditingFieldIndex(null)} style={{ flex:1, background:'#333', color:'#fff', padding:8, borderRadius:4 }}>Cancel</button>
            </div>
            {saveMessage && <p style={{textAlign:'center',marginTop:8}}>{saveMessage}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Halo */}
      {!haloExists && userFlow==='arc' && (
        <div style={{ textAlign:'center', margin:20 }}>
          <button onClick={handleGenerateHalo} style={{ padding:'10px 20px', background:'#39ff14', color:'#000', borderRadius:6 }}>Generate Halo Arc</button>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:24, padding:24 }}>
        {/* Left: Times Table, Map, Wallet */}
        <div>
          <div style={{ marginBottom:24, background:'#181f1b', padding:16, borderRadius:8 }}>
            <h3 style={{ color:'#39ff14' }}>Times Table</h3>
            <button style={{ marginRight:8 }}>Make Time</button>
            <button>Sync</button>
          </div>
          <div style={{ width:'100vw', height:'20vh', marginBottom:24 }}>
            <GoogleMapReact
              defaultCenter={{ lat:40.7128, lng:-74.0060 }}
              defaultZoom={11}
              bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' }}
            >
              <div lat={40.7128} lng={-74.0060} style={{ fontSize:24 }}>📍</div>
            </GoogleMapReact>
          </div>
          <WalletPanel />
        </div>

        {/* Center: FAM Awards & Tickets */}
        <div>
          <h3 style={{ color:'#39ff14', marginBottom:12 }}>FAM Awards</h3>
          <div style={{ display:'flex', overflowX:'auto', gap:12, marginBottom:24 }}>
            {famAwards.map(a=>(
              <div key={a.id} style={{ background:'#101314', padding:10, borderRadius:8, minWidth:160 }}>
                <img src={a.img_url} alt={a.title} style={{ width:'100%', borderRadius:6, marginBottom:6 }} />
                <div style={{ color:'#eee', fontSize:14 }}>{a.title}</div>
                <div style={{ color:'#aaa', fontSize:12 }}>Winner: {a.winner}</div>
              </div>
            ))}
          </div>
          <h3 style={{ color:'#39ff14', marginBottom:12 }}>Live Tickets</h3>
          <div style={{ display:'flex', overflowX:'auto', gap:12 }}>
            {liveTickets.map(t=>(
              <div key={t.id} onClick={()=>setShowQR(prev=>({...prev,[t.id]:!prev[t.id]}))} style={{ background:'#101314', padding:10, borderRadius:8, minWidth:160, cursor:'pointer' }}>
                {showQR[t.id] ? (
                  <>
                    <QRCode value={t.id} size={100} fgColor="#39ff14" bgColor="#000" />
                    <div style={{ color:'#ccc', fontSize:12 }}>Tap to hide QR</div>
                  </>
                ) : (
                  <>   <div style={{ color:'#eee', fontSize:14 }}>{t.event}</div>
                    <div style={{ color:'#aaa', fontSize:12 }}>{t.date} • {t.venue}</div>
                    <div style={{ color:'#fecf2f', fontSize:12 }}>Seat: {t.seat}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: IdeaFlight */}
        <div>
          <div style={{ background:'#181f1b', padding:16, borderRadius:8 }}>
            <h3 style={{ color:'#39ff14', marginBottom:12 }}>IdeaFlight</h3>
            <p style={{ color:'#eee', marginBottom:12 }}>Plan and launch new initiatives</p>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:10, background:'#1b2', color:'#fff', borderRadius:6 }}>Create</button>
              <button style={{ flex:1, padding:10, background:'transparent', color:'#39ff14', border:'2px solid #39ff14', borderRadius:6 }}>Go to Space</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
