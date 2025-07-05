// pages/business/art.tsx
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import WalletPanel from '@/components/WalletPanel'
import AuthForm from '@/components/AuthForm'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

// Setup form for saving card
function SaveCardForm({ userId, onSuccess }: { userId: string, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [clientSecret, setClientSecret] = useState<string|null>(null)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    // create a SetupIntent on the server
    fetch('/api/create-setup-intent', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ userId }) })
      .then(r=>r.json())
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => setError(err.message))
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    const card = elements.getElement(CardElement)
    if (!card) return
    const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, { payment_method: { card } })
    if (stripeError) setError(stripeError.message || 'Setup failed')
    else {
      // save the payment method ID to profile
      await supabase.from('business_profiles').upsert({ user_id: userId, wallet_connected:'card', payment_method_id: setupIntent.payment_method }, { onConflict:'user_id' })
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, padding:16 }}>
      <Elements stripe={stripePromise}>
        <CardElement options={{ style: { base: { color: '#fff' } } }} />
        <button type="submit" disabled={!stripe} style={{ marginTop:12, padding:'8px 12px' }}>Save Card</button>
        {error && <div style={{ color:'red', marginTop:8 }}>{error}</div>}
      </Elements>
    </form>
  )
}

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
  const currentField = editingFieldIndex!==null ? fields[editingFieldIndex] : null

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
      .upsert({ user_id: user.id, halo_id: newId }, { onConflict:'user_id' })
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
    else update[field]=fieldValue
    await supabase.from(table).upsert(update,{ onConflict:'user_id' })
    setUserData(prev=>({ ...prev, ...update })); setSaveMessage('✅ Saved')
    setEditingFieldIndex(null); setTimeout(()=>setSaveMessage(null),2500)
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
            {currentField==='display_image' ? (
              <input type="file" accept="image/*" onChange={async e=>{
                if(!e.target.files?.[0]) return
                const file=e.target.files[0]
                const path=`avatars/${user.id}/${file.name.replace(/\s+/g,'')}`
                await supabase.storage.from('public').upload(path,file,{upsert:true})
                const url= supabase.storage.from('public').getPublicUrl(path).data.publicUrl
                await supabase.from('halo_profiles').update({ display_image:url }).eq('user_id',user.id)
                setUserData(prev=>({ ...prev, display_image:url }))
                setEditingFieldIndex(null)
              }} />
            ) : currentField==='wallet_connected' && fieldValue==='card' ? (
              <SaveCardForm userId={user.id} onSuccess={()=>{ loadUserData(); setEditingFieldIndex(null) }} />
            ) : currentField==='portfolio' ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {portfolioOptions.map(opt=>(
                  <label key={opt} style={{
                    padding:'6px 10px',borderRadius:6,cursor:'pointer',background:userData.portfolio?.includes(opt)?'#39ff14':'#444',color:'#000'
                  }}>
