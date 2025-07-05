// pages/business/art.tsx

// ... other imports
import React, { useState } from 'react';
import Link from 'next/link';
import WalletPanel from '@/components/WalletPanel';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useRouter } from 'next/router';

// ...demo data...

export default function ArtDepartment() {
  const [onboardIndex, setOnboardIndex] = useState(2);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [showTooltip, setShowTooltip] = useState(false); // Tooltip state
  const router = useRouter();

  return (
    <div style={{ padding: 28, background: '#191c24', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        {/* Left: Onboarding + Go Public + About Me */}
        <div style={{ flex: '1 1 340px', minWidth: 340 }}>
          {/* --- ABOUT ME BUTTON --- */}
          <div style={{ marginBottom: 18, position: 'relative', display: 'inline-block' }}>
            <button
              style={{
                background: '#0af',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              About Me
            </button>
            {showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  left: '110%',
                  top: 0,
                  background: '#222',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: 10,
                  boxShadow: '0 2px 16px #0005',
                  whiteSpace: 'pre-line',
                  fontSize: 15,
                  minWidth: 280,
                  maxWidth: 330,
                  zIndex: 10,
                }}
              >
                The art of contracts, consulting, finance, communication, and planning and organization—
                all the important stuff artfully done, all in one place for you.
                <div style={{ marginTop: 12 }}>
                  <Link
                    href="/contracts"
                    style={{
                      color: '#0af',
                      textDecoration: 'underline',
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    Go to Contracts & Consulting
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Onboarding Timeline */}
          <div style={{ marginBottom: 32 }}>
            {/* ... rest of onboarding code ... */}
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Onboarding</div>
            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
              {/* ... */}
            </div>
            <div style={{ textAlign: 'right', marginTop: 14 }}>
              <button
                style={{
                  padding: '8px 18px', borderRadius: 8, background: '#0af', color: '#fff',
                  fontWeight: 700, fontSize: 16, border: 'none', marginLeft: 8,
                }}
                onClick={() => router.push('/go-public')}
              >
                Artgang: Go Public
              </button>
            </div>
          </div>

          {/* AGX License/Worker Panel */}
          <div style={{ marginBottom: 28 }}>
            <button
              style={{
                padding: '10px 22px', borderRadius: 8, background: '#10b981', color: '#fff',
                fontWeight: 700, fontSize: 16, border: 'none', marginRight: 14
              }}
              onClick={() => router.push('/agx-license')}
            >
              AGX License Panel
            </button>
            <Link href="/contracts" style={{ color: '#0af', fontWeight: 700, fontSize: 16, marginLeft: 10 }}>
              Contracts & Consultation
            </Link>
          </div>

          {/* Wallet Panel */}
          <div style={{ marginBottom: 32 }}>
            <WalletPanel />
            <div style={{ fontSize: 14, color: '#0af7', marginTop: 4 }}>
              Connect your agent wallet/API for payments, royalties, and digital assets.
            </div>
          </div>
        </div>

        {/* ...rest of page unchanged... */}
      </div>
    </div>
  );
}
