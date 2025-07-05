// pages/business/art.tsx
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AuthForm from '@/components/AuthForm'
import WalletPanel from '@/components/WalletPanel'
import PaymentForm from '@/components/PaymentForm'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaidLink } from 'react-plaid-link'
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
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [fieldValue, setFieldValue] = useState<any>('')
  const [bizName, setBizName] = useState<string>('')
  const [bizRole, setBizRole] = useState<string>('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [famAwards, setFamAwards] = useState<any[]>([])
  const [liveTickets, setLiveTickets] = useState<any[]>([])
  const [timesTable, setTimesTable] = useState<any[]>([])
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({})
  const [haloExists, setHaloExists] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [linkToken, setLinkToken] = useState<string>('')

  const fields = userFlow === 'arc' ? onboardingArcFields : onboardingBizFields
  const currentField = editingFieldIndex !== null ? fields[editingFieldIndex] : null

  // load all data
  const loadUserData = async () => {
    const { data: auth } = await supabase.auth.getUser()
    const u = auth?.user
    if (!u) return setUser(null)
    setUser(u)
    const { data: udata } = await supabase.from('users').select('*').eq('id', u.id).single()
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
    supabase.from('fam_awards').select('*').order('year', { ascending: false }).then(r => setFamAwards(r.data || []))
    supabase.from('tickets').select('*').then(r => setLiveTickets(r.data || []))
    supabase.from('times_table').select('*').order('time', { ascending: true }).then(r => setTimesTable(r.data || []))
    // fetch Plaid link token
    fetch('/api/create-plaid-link-token', { method: 'POST' })
      .then(res => res.json())
      .then(data => setLinkToken(data.link_token || ''))
      .catch(() => setLinkToken(''))
  }, [])

  // Plaid Link setup
  const onSuccess = async (publicToken: string) => {
    if (!user) return
    const update = { user_id: user.id, wallet_connected: 'plaid', bank_public_token: publicToken }
    await supabase.from('business_profiles').upsert(update, { onConflict: 'user_id' })
    setUserData(prev => ({ ...prev, ...update }))
    setSaveMessage('✅ Bank connected!')
    setTimeout(() => setSaveMessage(null), 2500)
  }
  const { open, ready } = usePlaidLink({ token: linkToken, onSuccess })

  // connect handler now always clickable when token is ready
  const handleConnectBank = () => {
    if (ready) open()
  }

  const completed = fields.filter(f => userData[f]).length
  const progress = Math.floor((completed / fields.length) * 100)

  return (
    <>
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 100
            }}
          >
            <div style={{ background: '#111', padding: 24, borderRadius: 8, width: 320 }}>
              <AuthForm
                onAuth={async () => {
                  setShowAuthModal(false)
                  await loadUserData()
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ... rest of component unchanged ... */}

      {/* Wallet Section */}
      <section style={{ padding: 24, background: '#222' }}>
        <h2 style={{ color: '#39ff14', marginBottom: 12 }}>Wallet & Payments</h2>
        <WalletPanel />
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleConnectBank}
            disabled={!linkToken}
            style={{
              background: '#39ff14', color: '#000', padding: '12px 24px',
              border: 'none', borderRadius: 6, cursor: linkToken ? 'pointer' : 'not-allowed'
            }}
          >
            {linkToken ? 'Connect Bank Account' : 'Loading...'}
          </button>
        </div>
      </section>

      {saveMessage && (
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#000', color: '#39ff14', padding: '8px 16px', borderRadius: 4
        }}>
          {saveMessage}
        </div>
      )}
    </>
  )
}
