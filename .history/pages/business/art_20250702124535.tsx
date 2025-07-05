'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { FaBusinessTime, FaWallet, FaList, FaMoneyBill, FaRocket, FaUserShield, FaHeartbeat, FaBrain, FaBalanceScale, FaClock } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'
import WalletPanel from '@/components/WalletPanel'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'
import { useRouter } from 'next/router'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const businessFlow = [
  { label: 'Register Business', icon: <FaBusinessTime /> },
  { label: 'Setup Wallet', icon: <FaWallet /> },
  { label: 'List Services', icon: <FaList /> },
  { label: 'Accept Payments', icon: <FaMoneyBill /> },
  { label: 'Launch', icon: <FaRocket /> }
]

const arcSessionFlow = [
  { label: 'Identity', icon: <FaUserShield /> },
  { label: 'Diet & Wellness', icon: <FaHeartbeat /> },
  { label: 'Purpose', icon: <FaBrain /> },
  { label: 'Ethics', icon: <FaBalanceScale /> },
  { label: 'Time Practices', icon: <FaClock /> },
  { label: 'KYC Verified', icon: <FaUserShield /> }
]

export default function ArtDepartment() {
  const [onboardBusiness, setOnboardBusiness] = useState(1)
  const [onboardArc, setOnboardArc] = useState(2)
  const [mapVisible, setMapVisible] = useState(true)
  const [tickets, setTickets] = useState<any[]>([])
  const [famAwards, setFamAwards] = useState<any[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.from('tickets').select('*').then(({ data }) => setTickets(data || []))
    supabase.from('fam_awards').select('*').then(({ data }) => setFamAwards(data || []))
    supabase.from('settings').select('value').eq('key', 'videourl').single().then(({ data }) => {
      setVideoUrl(data?.value || '/videos/splash.mp4')
    })
  }, [])

  return (
    <div className="relative min-h-screen bg-black text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-1]"
      >
        <source src={videoUrl || '/videos/splash.mp4'} type="video/mp4" />
      </video>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-4 left-6 text-2xl font-extrabold text-white drop-shadow-lg"
      >
        Art Department
      </motion.div>

      <div className="absolute top-4 right-24">
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-yellow-300 shadow-xl flex items-center justify-center text-black text-xs font-bold"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          AI
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-5 right-5 bg-white text-black rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm bg-opacity-90 cursor-pointer hover:scale-105 transition"
      >
        Hi, I'm AURA. Tap me for live help.
      </motion.div>

      <MotionSection>
        <div className="px-6 py-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex space-x-4 overflow-x-auto">
              {businessFlow.map((step, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  className={`flex flex-col items-center ${i === onboardBusiness ? 'text-yellow-400' : 'text-gray-400'}`}
                  onClick={() => setOnboardBusiness(i)}
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800">
                    {step.icon}
                  </div>
                  <span className="text-xs mt-1 whitespace-nowrap">{step.label}</span>
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => router.push('/agx-license')}
              className="bg-green-400 text-black font-bold px-4 py-2 rounded-xl shadow-lg"
            >
              Artgang
            </button>
          </div>

          <div className="flex space-x-4 overflow-x-auto">
            {arcSessionFlow.map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.2 }}
                className={`flex flex-col items-center ${i === onboardArc ? 'text-yellow-400' : 'text-gray-400'}`}
                onClick={() => setOnboardArc(i)}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800">
                  {step.icon}
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">{step.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-10">
        <div>
          <WalletPanel />
          <div className="mt-6 bg-gray-900 bg-opacity-60 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Times Table</h3>
            <p className="text-sm text-gray-300">(Coming soon…)</p>
          </div>
        </div>

        <div>
          <div className="bg-gray-900 bg-opacity-60 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-2">FAM Awards</h3>
            <div className="flex space-x-4 overflow-x-auto">
              {famAwards.map((award) => (
                <div key={award.id} className="min-w-[180px]">
                  <img src={award.img_url || award.image} alt={award.title} className="rounded-lg w-full" />
                  <p className="text-sm mt-2 font-semibold">{award.title}</p>
                  <p className="text-xs text-gray-400">Winner: {award.winner}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 bg-opacity-60 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Live Tickets</h3>
            <div className="flex flex-col space-y-2">
              {tickets.map((ticket, i) => (
                <div key={i} className="border border-green-400 px-4 py-2 rounded-lg text-sm bg-black bg-opacity-50">
                  <div className="font-semibold">{ticket.event}</div>
                  <div className="text-xs text-gray-300">{ticket.date} · {ticket.venue}</div>
                  <div className="text-xs text-yellow-400">Seat: {ticket.seat}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-900 bg-opacity-60 p-4 rounded-lg h-full">
            <h3 className="text-xl font-bold mb-2">IdeaFlight</h3>
            <p className="text-sm text-gray-300 mb-3">
              Organize and launch new creative ideas. Collaborate with peers in real-time.
            </p>
            <div className="flex space-x-2">
              <button className="bg-green-400 text-black font-bold px-3 py-2 rounded-lg">Create</button>
              <button className="bg-transparent border border-green-400 text-green-400 font-bold px-3 py-2 rounded-lg">Go to Space</button>
            </div>
          </div>
        </div>
      </div>

      {mapVisible && (
        <div className="w-full h-[300px]">
          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! }}
            defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
            defaultZoom={12}
          >
            <div lat={40.7128} lng={-74.0060} className="text-2xl">🎨</div>
          </GoogleMapReact>
        </div>
      )}
    </div>
  )
}
