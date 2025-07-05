import React, { useState } from 'react';
import Link from 'next/link';

const heroOptions = [
  // ...
  // [First 2 hero cards unchanged]
  // ...
  {
    key: 'pro-custom',
    title: '🚀 Pro/Custom App & Quote',
    price: '$1000+ & 10% Revenue Share',
    desc: "Premium custom app. Full feature list, market entry, and partnership.",
    action: "Request Custom Quote",
  },
];

const demoContracts = [
  // Your demo contracts as before
];

// Features and prices for the custom quote builder
const FEATURES = [
  { name: 'Streaming', price: 300 },
  { name: 'Downloads', price: 200 },
  { name: 'Fan Wall', price: 150 },
  { name: 'Analytics Dashboard', price: 250 },
  { name: 'E-Commerce Store', price: 300 },
  { name: 'Custom Domain', price: 80 },
  { name: 'Push Notifications', price: 120 },
  { name: 'AI Chat Agent', price: 400 },
  { name: 'Artist Onboarding Wizard', price: 100 },
];

export default function ContractsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState('App');
  const [customWith, setCustomWith] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  // Consultation fee, show waived if total > $2000
  const total = selectedFeatures.reduce((sum, feat) => sum + (FEATURES.find(f => f.name === feat)?.price ?? 0), 0);
  const consultationFee = total > 2000 ? 0 : 100;

  // --- UI Below ---

  return (
    <div style={{
      padding: '32px 0',
      background: '#f8fafc',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -2 }}>Contracts & Onboarding</h1>
        <p style={{ color: '#555', marginBottom: 32 }}>
          Choose your onboarding path, manage agreements, or create a custom contract.
        </p>

        {/* HERO ONBOARDING OPTIONS */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 40,
          justifyContent: 'center'
        }}>
          {heroOptions.map(opt => (
            <div key={opt.key}
              style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 6px 40px #3331',
                padding: '32px 24px',
                minWidth: 300,
                maxWidth: 340,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginBottom: 0,
                position: 'relative'
              }}>
              <h2 style={{ fontSize: 26, margin: '0 0 12px', fontWeight: 700 }}>{opt.title}</h2>
              <div style={{
                fontSize: 19, fontWeight: 700, color: '#0af', marginBottom: 12
              }}>{opt.price}</div>
              <p style={{ fontSize: 15, margin: '0 0 18px', color: '#444', minHeight: 62 }}>
                {opt.desc}
              </p>
              {/* Artist Hosting and Simple App can just link, Pro/Custom triggers quote builder modal */}
              {opt.key === "pro-custom" ? (
                <button
                  onClick={() => setShowQuote(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    background: '#0af',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    boxShadow: '0 2px 14px #0af2',
                    cursor: 'pointer'
                  }}>
                  {opt.action}
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = opt.key === 'artist-hosting' ? "/create-coin" : "/contracts/app-quote"}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    background: '#0af',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    boxShadow: '0 2px 14px #0af2',
                    cursor: 'pointer'
                  }}>
                  {opt.action}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* CONTRACTS LIST/TABLE */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 18px #0001',
          padding: 28,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 22, marginBottom: 16, fontWeight: 700 }}>Your Contracts</h2>
          {demoContracts.length === 0 && (
            <div style={{ color: '#999', marginBottom: 18 }}>No contracts yet. Choose an onboarding option or create a custom contract below.</div>
          )}
          <table style={{ width: '100%', borderSpacing: 0 }}>
            <thead>
              <tr style={{ color: '#444', fontWeight: 600 }}>
                <td style={{ padding: 6 }}>Title</td>
                <td style={{ padding: 6 }}>Status</td>
                <td style={{ padding: 6 }}>With</td>
                <td style={{ padding: 6 }}>Amount</td>
                <td style={{ padding: 6 }}>Details</td>
              </tr>
            </thead>
            <tbody>
              {demoContracts.map(contract => (
                <tr key={contract.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 6 }}>{contract.title}</td>
                  <td style={{ padding: 6 }}>{contract.status}</td>
                  <td style={{ padding: 6 }}>{contract.counterpart}</td>
                  <td style={{ padding: 6 }}>{contract.amount}</td>
                  <td style={{ padding: 6 }}>
                    <Link href={`/contracts/${contract.id}`}>
                      <span style={{ color: '#0af', cursor: 'pointer' }}>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CREATE CONTRACT MODAL */}
        <button
          style={{
            background: '#fff',
            border: '2px solid #0af',
            color: '#0af',
            padding: '16px 24px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 4px 18px #0af2',
            cursor: 'pointer',
            display: 'block',
            margin: '0 auto'
          }}
          onClick={() => setShowCreate(true)}
        >
          + Create Custom Contract
        </button>
        {/* Custom contract form */}
        {showCreate && (
          <div style={{
            background: '#111c',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              background: '#fff',
              padding: 32,
              borderRadius: 18,
              minWidth: 350,
              maxWidth: 480
            }}>
              <h2>Create Custom Contract</h2>
              <label>Title<br />
                <input value={customTitle} onChange={e => setCustomTitle(e.target.value)} style={{ width: '100%', margin: '8px 0 12px' }} />
              </label>
              <label>With (user/email/org)<br />
                <input value={customWith} onChange={e => setCustomWith(e.target.value)} style={{ width: '100%', margin: '8px 0 12px' }} />
              </label>
              <label>Type<br />
                <select value={customType} onChange={e => setCustomType(e.target.value)} style={{ width: '100%', margin: '8px 0 12px' }}>
                  <option>App</option>
                  <option>Sponsorship</option>
                  <option>Collab</option>
                  <option>Music/Art Sale</option>
                </select>
              </label>
              <label>Amount ($)<br />
                <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)} style={{ width: '100%', margin: '8px 0 12px' }} />
              </label>
              <label>Description / Terms<br />
                <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)} style={{ width: '100%', margin: '8px 0 16px' }} rows={3} />
              </label>
              <button style={{
                background: '#0af',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                border: 'none',
                marginTop: 12
              }} onClick={() => setShowCreate(false)}>Submit</button>
              <button style={{
                background: '#eee',
                color: '#111',
                padding: '8px 16px',
                borderRadius: 6,
                fontWeight: 500,
                border: 'none',
                marginLeft: 10
              }} onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* CUSTOM QUOTE BUILDER */}
        {showQuote && (
          <div style={{
            background: '#111c',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              background: '#fff',
              padding: 36,
              borderRadius: 18,
              minWidth: 350,
              maxWidth: 530,
              boxShadow: '0 4px 32px #0af3'
            }}>
              <h2>Custom App Quote</h2>
              <p>Select features for your app. Consultation fee: <b>${consultationFee}</b> {consultationFee === 0 && <span style={{ color: '#0af' }}>(waived)</span>}</p>
              <div>
                {FEATURES.map(f => (
                  <div key={f.name} style={{ marginBottom: 10 }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(f.name)}
                        onChange={() =>
                          setSelectedFeatures(sf =>
                            sf.includes(f.name)
                              ? sf.filter(x => x !== f.name)
                              : [...sf, f.name]
                          )
                        }
                      />
                      {" "}{f.name} <span style={{ color: '#0af', fontWeight: 700 }}>${f.price}</span>
                    </label>
                  </div>
                ))}
              </div>
              <hr style={{ margin: '20px 0' }} />
              <div>
                <b>Estimated Total: </b>
                <span style={{ fontSize: 18, color: '#0af' }}>${total + consultationFee}</span>
              </div>
              <button
                style={{
                  background: '#0af',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 9,
                  fontWeight: 700,
                  border: 'none',
                  marginTop: 18
                }}
                onClick={() => {
                  alert(`Quote submitted! We'll review and contact you with your contract offer.`);
                  setShowQuote(false);
                }}
              >Request Custom Quote</button>
              <button
                style={{
                  background: '#eee',
                  color: '#111',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontWeight: 500,
                  border: 'none',
                  marginLeft: 10
                }}
                onClick={() => setShowQuote(false)}
              >Cancel</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
