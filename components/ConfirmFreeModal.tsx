import React from 'react'

interface ConfirmFreeModalProps {
  open: boolean
  onConfirm: () => void
  onClose: () => void
  coinName: string
  amount: number
}

const ConfirmFreeModal: React.FC<ConfirmFreeModalProps> = ({
  open,
  onConfirm,
  onClose,
  coinName,
  amount,
}) => {
  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#181825',
        borderRadius: 16,
        padding: '2rem',
        width: 320,
        maxWidth: '90vw',
        boxShadow: '0 8px 32px #0af3',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#0af', marginBottom: 16 }}>Confirm Free Purchase</h2>
        <p style={{ color: '#fff', fontSize: 18 }}>
          Are you sure you want to claim <strong>{coinName}</strong> for <strong>${amount.toFixed(2)}</strong>?
        </p>
        <button
          onClick={onConfirm}
          style={{
            background: '#0af',
            color: '#111',
            padding: '10px 18px',
            borderRadius: 8,
            fontWeight: 'bold',
            border: 'none',
            marginTop: 16,
            width: '80%',
            cursor: 'pointer'
          }}
        >
          Confirm & Claim
        </button>
        <button
          onClick={onClose}
          style={{
            marginTop: 10,
            color: '#bbb',
            background: 'transparent',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            width: '80%'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ConfirmFreeModal
