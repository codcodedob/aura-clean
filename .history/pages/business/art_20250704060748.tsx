// pages/business/art.tsx
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import WalletPanel from '@/components/WalletPanel'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const onboardingArcFields = [
  'halo_id', 'birthday', 'age', 'sex', 'address',
  'parent_a_halo', 'parent_z_halo', 'username', 'display_image', 'shipping_address', 'halo_range'
]

const onboardingBizFields = [
  'account_created', 'art_role', 'portfolio', 'wallet_connected', 'verification', 'artgang'
]

export default function BusinessArtPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>({})
  const [userFlow, setUserFlow] = useState<'arc'|'business'>('business')
  const [editingFieldIndex, setEditingFieldIndex] = useState<number|null>(null)
  const [fieldValue, setFieldValue] = useState<any>('')
  const [saveMessage, setSaveMessage] = useState<string|null>(null)
  const [famAwards, setFamAwards] = useState<any[]>([])
  const [liveTickets, setLiveTickets] = useState<any[]>([])
  const [showQR, setShowQR] = useState<{ [k:string]: boolean }>({})
  const [haloExists, setHaloExists] = useState(false)

  const fields = userFlow === 'arc' ? onboardingArcFields : onboardingBizFields
  const currentField = editingFieldIndex !== null ? fields[editingFieldIndex] : null

  // Fetch user & profile data
  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      const u = auth?.user
      if (!u) return
      setUser(u)
      // load users table
      const { data: udata } = await supabase.from('users').select('*').eq('id', u.id).single()
      let merged = udata || {}
      // load halo_profiles
      const { data: halo } = await supabase.from('halo_profiles').select('*').eq('user_id', u.id).single()
      if (halo) {
        merged = { ...merged, ...halo }
        if (halo.halo_id) setHaloExists(true)
      }
      // load business_profiles
      const { data: biz } = await supabase.from('business_profiles').select('*').eq('user_id', u.id).single()
      if (biz) merged = { ...merged, ...biz }
      setUserData(merged)
    }
    load()
    supabase.from('fam_awards').select('*').order('year',{ascending:false}).then(r=>setFamAwards(r.data||[]))
    supabase.from('tickets').select('*').then(r=>setLiveTickets(r.data||[]))
  }, [])

  const handleGenerateHalo = async () => {
    if (!user || haloExists) return
    const newId = `halo_${uuidv4()}`
    // upsert halo_profiles
    const { error } = await supabase.from('halo_profiles').upsert({ user_id: user.id, halo_id: newId }, { onConflict: 'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, halo_id: newId }))
      setHaloExists(true)
      setSaveMessage('🛸 Halo generated!')
    } else setSaveMessage('❌ Could not generate halo')
    setTimeout(()=>setSaveMessage(null),3000)
  }

  const handleSaveField = async () => {
    if (editingFieldIndex===null || !user) return
    const field = fields[editingFieldIndex]
    const table = onboardingArcFields.includes(field) ? 'halo_profiles' : 'business_profiles'
    const update = { user_id: user.id, [field]: fieldValue }
    const { error } = await supabase.from(table).upsert(update, { onConflict:'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, [field]: fieldValue }))
      setSaveMessage('✅ Saved')
    } else {
      console.error(error)
      setSaveMessage('❌ Save failed')
    }
    setEditingFieldIndex(null)
    setTimeout(()=>setSaveMessage(null),2500)
  }

  const completed = fields.filter(f=>userData[f]!==undefined && userData[f]!==null && userData[f]!=='' ).length
  const progress = Math.floor((completed/fields.length)*100)

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', position:'relative' }}>
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
            onClick={()=>{ setEditingFieldIndex(i); setFieldValue(userData[f]||'') }}
            style={{
              padding:'8px 12px', borderRadius:6,
              background:userData[f]?'#1a1a1a':'transparent',
              color:userData[f]?'#39ff14':'#888', border:'none', cursor:'pointer'
            }}
          >{userData[f]?`✔ ${f}`:f}</motion.button>
        ))}
      </div>

      <AnimatePresence>
        {editingFieldIndex!==null && (
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            style={{ background:'#111', padding:16, borderRadius:6, maxWidth:400, margin:'0 auto' }}>
            <h3>Edit {currentField}</h3>
            <input value={fieldValue} onChange={e=>setFieldValue(e.target.value)}
              style={{ width:'100%', padding:8, marginBottom:12, borderRadius:4 }} />
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
          <div style={{ height: '30vh', marginBottom:24 }}>
            <GoogleMapReact defaultCenter={{lat:40.7128,lng:-74.006}} defaultZoom={11} bootstrapURLKeys={{key:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY||''}}>
              <div lat={40.7128} lng={-74.006} style={{fontSize:24}}>📍</div>
            </GoogleMapReact>
          </div>
          <WalletPanel />
        </div>

        {/* Center: Fam Awards & Live Tickets */}
        <div>
          <section style={{ marginBottom:32 }}>
            <h2 style={{ color:'#39ff14' }}>FAM Awards</h2>
            <div style={{ display:'flex', overflowX:'auto', gap:12 }}>
              {famAwards.map(a=>(
                <div key={a.id} style={{ minWidth:160, background:'#101314', padding:10, borderRadius:6 }}>
                  <img src={a.img_url} alt={a.title} style={{ width:'100%', borderRadius:4 }} />
                  <p style={{ margin:4, color:'#eee' }}>{a.title}</p>
                  <small style={{ color:'#aaa' }}>Winner: {a.winner}</small>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ color:'#39ff14' }}>Live Tickets</h2>
            <div style={{ display:'flex', overflowX:'auto', gap:12 }}>
              {liveTickets.map(t=>(
                <div key={t.id} style={{ minWidth:160, background:'#101314', padding:10, borderRadius:6, cursor:'pointer' }} onClick={()=>setShowQR(prev=>({...prev,[t.id]:!prev[t.id]}))}>
                  {showQR[t.id]
                    ? <QRCode value={t.id} size={100} bgColor="#000" fgColor="#39ff14" />
                    : <>
                        <p style={{ color:'#eee' }}>{t.event}</p>
                        <small style={{ color:'#aaa' }}>{t.date}</small>
                      </>
                  }
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: IdeaFlight */}
        <div>
          <div style={{ background:'#181f1b', padding:16, borderRadius:8 }}>
            <h3 style={{ color:'#39ff14' }}>IdeaFlight</h3>
            <p style={{ color:'#eee' }}>Plan new initiatives</p>
            <button style={{ marginRight:8 }}>Create</button>
            <button>Go to Space</button>
          </div>
        </div>
      </div>

    </div>
  )
}
