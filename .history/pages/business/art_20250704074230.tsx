// pages/business/art.tsx
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import WalletPanel from '@/components/WalletPanel'
import PaymentForm from '@/components/PaymentForm'
import AuthForm from '@/components/AuthForm'
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
  const [timesTable, setTimesTable] = useState<any[]>([])
  const [showQR, setShowQR] = useState<{ [k:string]: boolean }>({})
  const [haloExists, setHaloExists] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fields = userFlow === 'arc' ? onboardingArcFields : onboardingBizFields
  const currentField = editingFieldIndex !== null ? fields[editingFieldIndex] : null

  // load all data
  const loadUserData = async () => {
    const { data: auth } = await supabase.auth.getUser()
    const u = auth?.user; if (!u) return setUser(null)
    setUser(u)
    let { data: udata } = await supabase.from('users').select('*').eq('id', u.id).single()
    let merged = udata || {}
    const { data: halo } = await supabase.from('halo_profiles').select('*').eq('user_id', u.id).single()
    if (halo) { merged = { ...merged, ...halo }; if (halo.halo_id) setHaloExists(true) }
    const { data: biz } = await supabase.from('business_profiles').select('*').eq('user_id', u.id).single()
    if (biz) merged = { ...merged, ...biz }
    setUserData(merged)
  }

  useEffect(() => {
    loadUserData()
    supabase.from('fam_awards').select('*').order('year',{ascending:false}).then(r=>setFamAwards(r.data||[]))
    supabase.from('tickets').select('*').then(r=>setLiveTickets(r.data||[]))
    supabase.from('times_table').select('*').order('time',{ascending:true}).then(r=>setTimesTable(r.data||[]))
  }, [])

  // generate halo
  const handleGenerateHalo = async () => {
    if (!user || haloExists) return
    const newId = `halo_${uuidv4()}`
    const { error } = await supabase.from('halo_profiles')
      .upsert({ user_id: user.id, halo_id: newId }, { onConflict: 'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, halo_id: newId })); setHaloExists(true); setSaveMessage('🛸 Halo generated!')
    } else setSaveMessage('❌ Could not generate halo')
    setTimeout(()=>setSaveMessage(null),3000)
  }

  // save field
  const handleSaveField = async () => {
    if (editingFieldIndex===null || !user) return
    const field = fields[editingFieldIndex]
    const table = onboardingArcFields.includes(field) ? 'halo_profiles' : 'business_profiles'
    let update: any = { user_id: user.id }
    if (field==='art_role') { update.business_name=bizName; update.business_role=bizRole }
    else if (field==='wallet_connected') update.wallet_connected=fieldValue
    else update[field]=fieldValue
    await supabase.from(table).upsert(update,{onConflict:'user_id'})
    setUserData(prev=>({ ...prev, ...update })); setSaveMessage('✅ Saved')
    setEditingFieldIndex(null); setTimeout(()=>setSaveMessage(null),2500)
  }

  // wallet connect
  const handleWalletConnect = async (method:string) => {
    if (!user) return
    if (method==='stripe') { setFieldValue('stripe'); setEditingFieldIndex(fields.indexOf('wallet_connected')); return }
    const update={ user_id:user.id, wallet_connected:method }
    await supabase.from('business_profiles').upsert(update,{onConflict:'user_id'})
    setUserData(prev=>({ ...prev, wallet_connected:method })); setSaveMessage(`✅ Connected ${method}`)
    setTimeout(()=>setSaveMessage(null),2500)
  }

  const completed = fields.filter(f=>userData[f]).length
  const progress = Math.floor((completed/fields.length)*100)

  return (
    <>
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}
          >
            <div style={{background:'#111',padding:24,borderRadius:8,width:320}}>
              <AuthForm onAuth={async()=>{ setShowAuthModal(false); await loadUserData() }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow Toggle & Progress */}
      <div style={{ position:'sticky',top:0,background:'#111',padding:16,zIndex:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div>
          <button onClick={()=>setUserFlow('arc')} style={{ marginRight:12, color:userFlow==='arc'?'#39ff14':'#ccc',background:'none',border:'none',fontWeight:600 }}>ArcSession</button>
          <button onClick={()=>setUserFlow('business')} style={{ color:userFlow==='business'?'#39ff14':'#ccc',background:'none',border:'none',fontWeight:600 }}>Business</button>
        </div>
        <div>Progress: {progress}%</div>
      </div>

      {/* Stepper */}
      <div style={{ display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',padding:16,background:'#000' }}>
        {fields.map((f,i)=>(
          <motion.button key={f} onClick={()=>{
            if(f==='account_created'&&!user) return setShowAuthModal(true)
            setEditingFieldIndex(i); setFieldValue(userData[f]||'')
            if(f==='art_role'){ setBizName(userData.business_name||''); setBizRole(userData.business_role||'') }
          }} whileHover={{scale:1.05}} style={{
            padding:'8px 12px',borderRadius:6,cursor:'pointer',border:'none',
            background:userData[f]?'#1a1a1a':'#222', color:userData[f]?'#39ff14':'#ccc',fontWeight:600
          }}>{userData[f]?`✔ ${f}`:f}</motion.button>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingFieldIndex!==null && (
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            style={{position:'fixed',top:'20%',left:'50%',transform:'translateX(-50%)',background:'#111',padding:24,borderRadius:8,zIndex:100,width:'90%',maxWidth:400}}
          >
            <h3 style={{marginBottom:12}}>Edit {currentField}</h3>
            {currentField==='portfolio' ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {portfolioOptions.map(opt=>(
                  <label key={opt} style={{
                    padding:'6px 10px',borderRadius:6,cursor:'pointer',background:userData.portfolio?.includes(opt)?'#39ff14':'#444',color:'#000'
                  }}>
                    <input type="checkbox" checked={userData.portfolio?.includes(opt)} onChange={()=>{
                      const arr=userData.portfolio||[];
                      const next=arr.includes(opt)?arr.filter(a=>a!==opt):[...arr,opt];
                      setFieldValue(next)
                    }} style={{display:'none'}} />
                    {opt}
                  </label>
                ))}
              </div>
            ) : currentField==='wallet_connected' ? (
              fieldValue==='stripe' ? (
                <PaymentForm userId={user.id} amount={0} onSuccess={async()=>{ await loadUserData(); setEditingFieldIndex(null) }} />
              ) : (
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>handleWalletConnect('paypal')}>PayPal</button>
                  <button onClick={()=>handleWalletConnect('card')}>Credit/Debit Card</button>
                </div>
              )
            ) : (
              <input value={fieldValue} onChange={e=>setFieldValue(e.target.value)}
                style={{ width:'100%', padding:8, marginBottom:12, borderRadius:4, border:'1px solid #444', background:'#222', color:'#fff' }}
              />
            )}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setEditingFieldIndex(null)} style={{background:'transparent',color:'#ccc'}}>Cancel</button>
              <button onClick={handleSaveField} style={{background:'#39ff14',color:'#000',padding:'6px 12px',borderRadius:4}}>Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div style={{width:'100vw',height:'20vh',background:'#111'}}>
        <GoogleMapReact bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY||'' }} defaultCenter={{lat:40.7128,lng:-74.0060}} defaultZoom={12}>
          <div style={{position:'absolute',transform:'translate(-50%,-50%)'}}>
            <span style={{background:'#39ff14',color:'#191c24',borderRadius:'50%',padding:8,fontWeight:700}}>◎</span>
          </div>
        </GoogleMapReact>
      </div>

      {/* Times Table */}
      <section style={{padding:24,background:'#000'}}>
        <h2 style={{color:'#39ff14',marginBottom:12}}>Schedule</h2>
        <div style={{display:'flex',overflowX:'auto',gap:12}}>
          {timesTable.map(t=>(
            <div key={t.id} style={{background:'#111',padding:10,borderRadius:6,minWidth:120}}>
              <div style={{color:'#fff',fontSize:14}}>{t.label}</div>
              <div style={{color:'#aaa',fontSize:12}}>{t.time}</div>
            </div>
          ))}
        </div>
      </section>

      {/* IdeaFlight */}
      <section style={{padding:24,background:'#111'}}>
        <h2 style={{color:'#39ff14',marginBottom:12}}>IdeaFlight</h2>
        <div style={{display:'flex',overflowX:'auto',gap:12}}>
          <div style={{background:'#222',padding:16,borderRadius:8,minWidth:200}}>
            <h3 style={{color:'#39ff14'}}>Plan Your Project</h3>
            <button onClick={()=>router.push('/idea/create')} style={{marginTop:10}}>Create</button>
          </div>
          <div style={{background:'#222',padding:16,borderRadius:8,minWidth:200}}>
            <h3 style={{color:'#39ff14'}}>Go to Space</h3>
            <button onClick={()=>router.push('/space')} style={{marginTop:10}}>Space</button>
          </div>
        </div>
      </section>

      {/* Wallet */}
      <section style={{padding:24,background:'#222'}}>
        <WalletPanel />
      </section>

      {/* Awards & Tickets */}
      <section style={{padding:24,background:'#000'}}>
        <h2 style={{color:'#39ff14',marginBottom:12}}>FAM Awards</h2>
        <div style={{display:'flex',overflowX:'auto',gap:12}}>
          {famAwards.map(a=>(
            <div key={a.id} style={{background:'#111',padding:10,borderRadius:6,minWidth:160}}>
              <img src={a.img_url} alt={a.title} style={{width:'100%',borderRadius:4}} />
              <div style={{color:'#fff',fontSize:14,marginTop:6}}>{a.title}</div>
              <div style={{color:'#aaa',fontSize:12}}>Winner: {a.winner}</div>
            </div>
          ))}
        </div>
        <h2 style={{color:'#39ff14',margin:'24px 0 12px'}}>Live Tickets</h2>
        <div style={{display:'flex',overflowX:'auto',gap:12}}>
          {liveTickets.map(t=>(
            <div key={t.id} onClick={()=>setShowQR(prev=>({...prev,[t.id]:!prev[t.id]}))}
              style={{background:'#111',padding:10,borderRadius:6,minWidth:160,cursor:'pointer'}}>  
              {showQR[t.id] ? <QRCode value={t.id} size={80} fgColor='#39ff14' bgColor='#000'/> : (
                <>
                  <div style={{color:'#fff',fontSize:14}}>{t.event}</div>
                  <div style={{color:'#aaa',fontSize:12}}>{t.date}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {saveMessage && (
        <div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',background:'#000',color:'#39ff14',padding:'8px 16px',borderRadius:4}}>
          {saveMessage}
        </div>
      )}
    </>
  )
}
