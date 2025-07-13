import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const onboardingArcFields = [
  'halo_id', 'birthday', 'age', 'sex', 'address',
  'parent_a_halo', 'parent_z_halo', 'username', 'display_image', 'shipping_address', 'halo_range'
] as const

const onboardingBizFields = [
  'account_created', 'art_role', 'portfolio', 'wallet_connected', 'verification', 'artgang'
] as const

type OnboardingArcField = typeof onboardingArcFields[number]
type OnboardingBizField = typeof onboardingBizFields[number]
type Field = OnboardingArcField | OnboardingBizField

type UserData = Record<string, string | boolean | number | null | undefined>

export default function BusinessArtPage() {
  const [user] = useState<{ id: string; email?: string } | null>(null)
  const [userData] = useState<UserData>({})
  const [userFlow] = useState<'arc' | 'business'>('business')
  //const [editingFieldIndex] = useState<number | null>(null)
  //const [fieldValue] = useState<string>('')
  //const [bizName] = useState<string>('')
  //const [bizRole] = useState<string>('')
  const [saveMessage] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fields: readonly Field[] = userFlow === 'arc' ? onboardingArcFields : onboardingBizFields

  // Dummy userData loader for example
  useEffect(() => {
    // Load user data here and setUserData(...)
  }, [])

  const handleFieldClick = (index: number, field: Field) => {
    if (field === 'account_created' && !user) {
      setShowAuthModal(true)
      return
    }
    // no setter usage here, so no error
  }

  return (
    <>
      {/* Stepper */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          padding: 16,
          background: '#000',
        }}
      >
        {fields.map((f, i) => (
          <motion.button
            key={f}
            onClick={() => handleFieldClick(i, f)}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              border: 'none',
              background: userData[f] ? '#1a1a1a' : '#222',
              color: userData[f] ? '#39ff14' : '#ccc',
              fontWeight: 600,
            }}
          >
            {userData[f] ? `✔ ${f}` : f}
          </motion.button>
        ))}
      </div>

      {/* Save message */}
      {saveMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#000',
            color: '#39ff14',
            padding: '8px 16px',
            borderRadius: 4,
          }}
        >
          {saveMessage}
        </div>
      )}

      {/* Auth modal placeholder */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#111',
              padding: 24,
              borderRadius: 8,
              width: 320,
              color: '#fff',
            }}
          >
            {/* Insert your AuthForm component here */}
            <p>Authentication required</p>
            <button onClick={() => setShowAuthModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
