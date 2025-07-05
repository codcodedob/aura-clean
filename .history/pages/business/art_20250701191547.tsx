import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WalletPanel from '@/components/WalletPanel';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
// For Google Maps
const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });
// For QR codes
import { QRCodeSVG as QRCode } from 'qrcode.react';

const onboardingSteps = [
  'Create Account',
  'Complete Profile',
  'Choose Art Role',
  'Upload Portfolio',
  'Set Up Wallet',
  'Get Verified',
  'Go Public (Artgang)',
];

export default function ArtDepartment() {
  // Video BG state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // FAM Awards state
  const [famAwards, setFamAwards] = useState<any[]>([]);
  // Tickets state
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [onboardIndex, setOnboardIndex] = useState(2); // Demo step

  // Demo live tickets
  const liveTicketsDemo = [
    { id: 'evt1', event: 'Future Fest 2025', date: '2025-08-21', venue: 'Metro Arena', seat: 'GA' },
    { id: 'evt2', event: 'Dobe Launch', date: '2025-09-10', venue: 'AI Gallery', seat: 'B12' },
  ];

  // Fetch video URL from supabase
  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'videourl').single()
      .then(({ data }) => setVideoUrl(data?.value || null));
  }, []);

  // Fetch fam awards from supabase
  useEffect(() => {
    supabase.from('fam_awards').select('*').order('year', { ascending: false })
      .then(({ data }) => setFamAwards(data || []));
  }, []);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      background: '#191c24'
    }}>
      {/* Video Background */}
      {videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={videoUrl}
          style={{
            position: 'fixed',
            left: 0, top: 0, width: '100vw', height: '100vh',
            objectFit: 'cover', zIndex: 0, pointerEvents: 'none'
          }}
        />
      )}
      {/* Overlay to make content readable */}
      <div style={{
        position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
        background: 'linear-gradient(120deg,#222b 50%,#191c2480 100%)',
        zIndex: 1, pointerEvents: 'none'
      }} />

      {/* Main Content Layer */}
      <div style={{ position: 'relative', zIndex: 2, padding: 32 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
          {/* Left: Onboarding + Wallet + Map */}
          <div style={{ flex: '1 1 340px', minWidth: 340, maxWidth: 410 }}>
            {/* Onboarding Timeline */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Onboarding</div>
              <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
                {onboardingSteps.map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{
                      background: i < onboardIndex ? '#0af' : (i === onboardIndex ? '#fecf2f' : '#444'),
                      color: i < onboardIndex ? '#fff' : '#111',
                      padding: '7px 17px',
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 15,
                      minWidth: 100,
                      textAlign: 'center',
                      marginRight: 4,
                    }}>
                      {step}
                    </div>
                    {i < onboardingSteps.length - 1 && (
                      <div style={{ width: 30, height: 3, background: i < onboardIndex ? '#0af' : '#333', borderRadius: 2 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ textAlign: 'right', marginTop: 14 }}>
                <button
                  style={{
                    padding: '8px 18px', borderRadius: 8, background: '#0af', color: '#fff',
                    fontWeight: 700, fontSize: 16, border: 'none', marginLeft: 8,
                  }}
                  onClick={() => { /* route to go-public */ }}
                >
                  Artgang: Go Public
                </button>
              </div>
            </div>
            {/* Wallet Panel */}
            <div style={{ marginBottom: 28 }}>
              <WalletPanel />
              <div style={{ fontSize: 14, color: '#0af7', marginTop: 4 }}>Connect your agent wallet/API for payments, royalties, and digital assets.</div>
            </div>
            {/* Map Panel */}
            <div style={{
              height: 200, borderRadius: 14, overflow: 'hidden', marginBottom: 30, boxShadow: '0 2px 16px #0af3'
            }}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY! }}
                defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
                defaultZoom={12}
                yesIWantToUseGoogleMapApiInternals
                options={{ fullscreenControl: false, mapTypeControl: false, streetViewControl: false }}
              >
                {/* You can add map markers here */}
              </GoogleMapReact>
            </div>
          </div>

          {/* Middle: Fam Awards & Happenings */}
          <div style={{ flex: '1 1 400px', minWidth: 360 }}>
            {/* FAM Awards (Horizontal Scroll) */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>FAM Awards</div>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
                {(famAwards.length > 0 ? famAwards : [
                  // fallback mock data
                  { id: '1', title: 'Best New Artist', media: '/awards/artist1.jpg', winner: 'Jane D.', year: '2025', description: '', video_url: '' }
                ]).map(a => (
                  <div key={a.id} style={{
                    minWidth: 210, background: '#222', borderRadius: 14, padding: 14, boxShadow: '0 2px 16px #0af2'
                  }}>
                    <div style={{ fontWeight: 600 }}>{a.title} ({a.year})</div>
                    {a.media &&
                      <img src={a.media} alt={a.title} style={{ width: '100%', borderRadius: 10, margin: '10px 0' }} />
                    }
                    <div style={{ fontSize: 13, color: '#fefc' }}>Winner: <b>{a.winner}</b></div>
                    {a.description && <div style={{ fontSize: 12, color: '#ccc', margin: '8px 0' }}>{a.description}</div>}
                    {a.video_url && (
                      <video src={a.video_url} controls style={{ width: '100%', borderRadius: 8, marginTop: 6 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Happening Now & Upcoming Panel */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Happening Now & Upcoming</div>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
                {liveTicketsDemo.map(t => (
                  <div
                    key={t.id}
                    style={{
                      minWidth: 200, background: '#191c24', border: '1px solid #222',
                      borderRadius: 14, padding: 12, cursor: 'pointer'
                    }}
                    onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                  >
                    {showQR[t.id] ? (
                      <div>
                        <QRCode value={t.id} size={140} />
                        <div style={{ color: '#ccc', marginTop: 6, fontSize: 13 }}>Tap for details</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.event}</div>
                        <div style={{ fontSize: 13, color: '#eee' }}>{t.date} · {t.venue}</div>
                        <div style={{ fontSize: 13, color: '#fecf2f', margin: '4px 0' }}>Seat: {t.seat}</div>
                        <div style={{ color: '#ccc', fontSize: 13 }}>Tap to show QR</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Ideaflight Panel */}
          <div style={{ flex: '1 1 270px', minWidth: 250, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: -44, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
              <button style={{
                marginBottom: 12, background: '#0af', color: '#fff', borderRadius: 10,
                fontWeight: 700, fontSize: 15, padding: '10px 24px', border: 'none', boxShadow: '0 2px 10px #0af5'
              }}>
                Go to Space
              </button>
              <button style={{
                background: '#fecf2f', color: '#222', borderRadius: 10, fontWeight: 700, fontSize: 15,
                padding: '10px 24px', border: 'none', boxShadow: '0 2px 10px #fecf2f80'
              }}>
                Create Idea Flight
              </button>
            </div>
            <div style={{
              background: '#292c38bb', borderRadius: 18, padding: 22, marginTop: 48,
              fontWeight: 600, textAlign: 'center', minHeight: 240, boxShadow: '0 4px 20px #0004'
            }}>
              <span style={{ fontSize: 20, letterSpacing: 0.5 }}>Ideaflight Panel</span>
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>
                Organize and launch your ideas, projects, and business concepts.
              </div>
              {/* Insert Ideaflight logic/components here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
