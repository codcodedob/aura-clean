// pages/business/art.tsx
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import WalletPanel from '@/components/WalletPanel'
import PaymentForm from '@/components/PaymentForm'
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
    if (method === 'stripe') {
      // launch stripe form
      setFieldValue('stripe')
      setEditingFieldIndex(fields.indexOf('wallet_connected'))
      return
    }
    const update = { user_id: user.id, wallet_connected: method }
    const { error } = await supabase.from('business_profiles').upsert(update, { onConflict:'user_id' })
    if (!error) {
      setUserData(prev=>({ ...prev, wallet_connected: method }))
      setSaveMessage(`✅ Connected ${method}`)
    } else {
      setSaveMessage('❌ Connection failed')
    }
    setTimeout(()=>setSaveMessage(null),2500)
  }

  const completed = fields.filter(f=> userData[f]!==undefined && userData[f]!==null && userData[f]!=='').length
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
@@
      {/* Edit Modal */}
      <AnimatePresence>
        {editingFieldIndex!==null && (
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            style={{ background:'#111', padding:16, borderRadius:6, maxWidth:400, margin:'0 auto' }}>
            <h3>Edit {currentField}</h3>
            {currentField==='portfolio' ? (
@@
            ) : currentField==='wallet_connected' ? (
              <div style={{ marginBottom:12 }}>
                {/* Stripe Payment Form */}
                {fieldValue==='stripe' ? (
                  <PaymentForm userId={user.id} amount={0} />
                ) : (
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>handleWalletConnect('stripe')} style={{ flex:1, padding:8, borderRadius:4, background:'#39ff14', color:'#000' }}>Stripe</button>
                    <button onClick={()=>handleWalletConnect('paypal')} style={{ flex:1, padding:8, borderRadius:4, background:'#39ff14', color:'#000' }}>PayPal</button>
                  </div>
                )}
            ) : (
@@
```
