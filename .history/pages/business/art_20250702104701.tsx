// Art Department – Full Layout with splash.mp4, Wallet, Tickets, Fam Awards, IdeaFlight, Times View

'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { FaBusinessTime, FaWallet, FaList, FaMoneyBill, FaRocket, FaUserShield, FaHeartbeat, FaBrain, FaBalanceScale, FaClock } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'
import WalletPanel from '@/components/WalletPanel'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'
import { useRouter } from 'next/router'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const famAwards = [
  { id: '1', title: 'Best New Artist', winner: 'Jane D.', image: '/awards/artist1.jpg' },
  { id: '2', title: 'Best Product', winner: 'CanvasX', image: '/awards/product1.jpg' }
]

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
  const router = useRouter()

  useEffect(() => {
    supabase.from('tickets').select('*').then(({ data }) => setTickets(data || []))
  }, [])

  return (
    <div className="relative min-h-screen text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/splash.mp4" type="video/mp4" />
      </video>

      <MotionSection>
        <div className="px-6 py-8">
          <div className="flex justify-between">
            <div className="flex space-x-4">
              {businessFlow.map((step, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  className={`flex flex-col items-center ${i === onboardBusiness ? 'text-yellow-400' : 'text-gray-400'}`}
                  onClick={() => setOnboardBusiness(i)}
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700">
                    {step.icon}
                  </div>
                  <span className="text-xs mt-1">{step.label}</span>
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

          <div className="flex mt-4 space-x-4">
            {arcSessionFlow.map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.2 }}
                className={`flex flex-col items-center ${i === onboardArc ? 'text-yellow-400' : 'text-gray-400'}`}
                onClick={() => setOnboardArc(i)}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700">
                  {step.icon}
                </div>
                <span className="text-xs mt-1">{step.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-20">
        {/* Left Panel: Wallet & Times */}
        <div>
          <WalletPanel />
          <div className="mt-6 bg-black bg-opacity-30 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Times Table</h3>
            <p className="text-sm text-gray-300">(Coming soon…)</p>
          </div>
        </div>

        {/* Center: Fam Awards & Tickets */}
        <div>
          <div className="bg-black bg-opacity-30 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-2">FAM Awards</h3>
            <div className="flex space-x-4 overflow-x-auto">
              {famAwards.map((award) => (
                <div key={award.id} className="min-w-[180px]">
                  <img src={award.image} alt={award.title} className="rounded-lg w-full" />
                  <p className="text-sm mt-2 font-semibold">{award.title}</p>
                  <p className="text-xs text-gray-400">Winner: {award.winner}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black bg-opacity-30 p-4 rounded-lg">
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

        {/* Right Panel: IdeaFlight */}
        <div>
          <div className="bg-black bg-opacity-30 p-4 rounded-lg h-full">
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

      {/* Optional Map Section */}
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
