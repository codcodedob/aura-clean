import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import dynamic from 'next/dynamic'

// --- Import animated 3D bg component ---
const ThreeMagnetBG = dynamic(() => import('@/components/ThreeMagnetBG'), { ssr: false })

const ADMIN_EMAIL = "burks.donte@gmail.com"
// ...Coin interface and CoinCard definition here, unchanged...

// ...your CoinCard, FocusedAvatar, FullBodyAvatar, etc (unchanged from previous version)...

export default function Home() {
  // ...All your useState, useEffect, handlers as before...

  // Add for About Me tooltip
  const [hoverDept, setHoverDept] = useState<string | null>(null)
  const router = useRouter()

  // ...Your data fetching, CoinCard, and logic...

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* --- Video Background Layer --- */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          zIndex: 0,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          opacity: 0.76,
          pointerEvents: 'none',
        }}
      >
        <source src="/timewave.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* --- 3D Magnet Model Layer --- */}
      <ThreeMagnetBG />

      {/* --- Your panels --- */}
      <div style={{
        display: window.innerWidth < 800 ? 'block' : 'flex',
        position: 'relative',
        zIndex: 2,
        height: '100vh'
      }}>
        {/* ...LEFT PANEL (as before)... */}

        {/* ...CENTER PANEL (as before)... */}

        {/* RIGHT PANEL - Company Suite */}
        {(window.innerWidth >= 800 || activePanel === 'right') && (
          <div style={{ flex: 1, padding: 20, position: 'relative' }}>
            <h2>Company Suite</h2>
            {[
              {
                label: 'Art',
                path: '/business/art',
                desc: 'Art, AGX, Onboarding, Wallet',
                about: "The art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you."
              },
              { label: 'Entertainment', path: '/business/entertainment', desc: 'Live Shows, Music, Venues', about: null },
              { label: 'Cuisine', path: '/business/cuisine', desc: 'Restaurants, Food Delivery, Catering', about: null },
              { label: 'Fashion', path: '/business/fashion', desc: 'Design, Modeling, Retail', about: null },
              { label: 'Health & Fitness', path: '/business/health', desc: 'Health, Wellness, Fitness', about: null },
              { label: 'Science & Tech', path: '/business/science', desc: 'Tech, R&D, Consulting', about: null },
              { label: 'Community Clipboard', path: '/business/community', desc: 'Volunteer, Events, Forum', about: null }
            ].map((dept, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoverDept(dept.label)}
                onMouseLeave={() => setHoverDept(null)}
                style={{
                  marginBottom: 18,
                  padding: 20,
                  background: '#eee',
                  borderRadius: 12,
                  cursor: 'pointer',
                  boxShadow: '0 1px 6px #0af1',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  transform: hoverDept === dept.label ? 'scale(1.04) translateY(-3px)' : undefined,
                }}
                onClick={() => router.push(dept.path)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700 }}>{dept.label}</h3>
                    <p style={{ margin: 0, fontSize: 15 }}>{dept.desc}</p>
                  </div>
                  {/* Info icon for "about" */}
                  {dept.about && (
                    <span
                      onClick={e => {
                        e.stopPropagation()
                        router.push('/contracts')
                      }}
                      title="Go to Contracts & Consulting"
                      style={{
                        marginLeft: 12,
                        fontSize: 22,
                        color: '#0af',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        border: '1px solid #0af',
                        display: 'inline-block',
                        background: '#fff',
                        transition: 'background 0.2s'
                      }}
                    >ℹ️</span>
                  )}
                </div>
                {/* About Me Tooltip */}
                {dept.about && hoverDept === dept.label && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 12,
                    marginTop: 6,
                    background: '#111',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '12px 18px',
                    boxShadow: '0 6px 24px #0005',
                    fontSize: 15,
                    zIndex: 4,
                    minWidth: 240
                  }}>
                    {dept.about}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
