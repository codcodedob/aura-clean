// components/MultiPayModal.tsx
import React from 'react'

interface MultiPayModalProps {
  amount: number
  onClose: () => void
  onScreenshotUpload?: (file: File) => void
}

const PAYMENT_METHODS = [
  { name: 'PayPal', qr: '/qr/paypal.png', info: 'paypal.me/yourname' },
  { name: 'Cash App', qr: '/qr/cashapp.png', info: '$yourcashtag' },
  { name: 'Zelle', qr: '/qr/zelle.png', info: 'your@email.com' },
  { name: 'Square', qr: '/qr/square.png', info: 'SquarePay Name' },
]

export default function MultiPayModal({ amount, onClose, onScreenshotUpload }: MultiPayModalProps) {
  const [selected, setSelected] = React.useState<string | null>(null)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#181825', color: '#fff', borderRadius: 14, padding: 32, boxShadow: '0 2px 24px #0af3',
        maxWidth: 480, width: '95%', textAlign: 'center'
      }}>
        <h2 style={{ color: '#0af', marginBottom: 8 }}>Choose Payment Method</h2>
        <p>Amount: <b>${amount.toFixed(2)}</b></p>
        {selected ? (
          <>
            <h3 style={{ color: '#ffce4e', margin: '16px 0 8px' }}>{selected}</h3>
            <img
              src={PAYMENT_METHODS.find(m => m.name === selected)?.qr}
              alt={selected + " QR"}
              style={{ width: 180, height: 180, objectFit: 'contain', margin: '0 auto 12px', borderRadius: 12, border: '2px solid #fff' }}
            />
            <div style={{ color: '#ccc', marginBottom: 10 }}>
              {PAYMENT_METHODS.find(m => m.name === selected)?.info}
            </div>
            <div style={{ marginBottom: 16, color: '#aaa', fontSize: 13 }}>
              <b>Scan this QR code in your payment app.</b> After you send payment, you can optionally upload a screenshot for faster approval.
            </div>
            {/* Screenshot Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files?.[0] && onScreenshotUpload) {
                  onScreenshotUpload(e.target.files[0])
                  alert('Screenshot uploaded! Your payment is now pending admin review.')
                }
              }}
              style={{ marginBottom: 16, color: '#fff', width: '100%' }}
            />
            <button onClick={() => setSelected(null)}
              style={{ margin: 8, background: '#374151', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={onClose}
              style={{ margin: 8, background: '#0af', color: '#000', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              Done
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', margin: '24px 0' }}>
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.name}
                  onClick={() => setSelected(method.name)}
                  style={{
                    background: '#222',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: 8,
                    padding: '16px 24px',
                    minWidth: 120,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: 18
                  }}
                >
                  {method.name}
                </button>
              ))}
            </div>
            <button onClick={onClose}
              style={{ marginTop: 18, background: '#0af', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 'bold', fontSize: 17 }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
