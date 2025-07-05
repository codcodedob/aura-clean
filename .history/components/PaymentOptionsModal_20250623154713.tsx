import React from 'react';
import Image from 'next/image';

type PaymentOption = {
  name: string;
  qrImage?: string;
  link?: string;
  description?: string;
  action?: () => void;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    name: 'Cash App',
    qrImage: '/qrcodes/cashapp-qr.png',
    description: '$YourCashtag',
  },
  {
    name: 'Venmo',
    qrImage: '/qrcodes/venmo-qr.png',
    description: '@YourVenmoUsername',
  },
  {
    name: 'PayPal',
    qrImage: '/qrcodes/paypal-qr.png',
    description: 'paypal.me/yourname',
  },
  {
    name: 'Zelle',
    qrImage: '/qrcodes/zelle-qr.png',
    description: 'your@email.com',
  },
  {
    name: 'Square',
    qrImage: '/qrcodes/square-qr.png',
    description: 'Square payment link',
    link: 'https://squareup.com/pay/your-business-link',
  },
  {
    name: 'Credit/Debit Card (Stripe)',
    description: 'Pay securely by card, Apple Pay, or Google Pay',
    link: '', // Handled by your handleCardPayment function below
    // No QR code—button will trigger Stripe checkout
  },
];

interface PaymentOptionsModalProps {
  show: boolean;
  onClose: () => void;
  onStripePay: () => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({
  show,
  onClose,
  onStripePay,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 36,
          minWidth: 330,
          boxShadow: '0 4px 48px #0006',
          maxWidth: 500,
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, color: '#1e293b', fontWeight: 700 }}>Choose Payment Method</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Scan a QR code or tap to pay by card:</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          marginBottom: 22,
        }}>
          {PAYMENT_OPTIONS.map(option =>
            option.name !== 'Credit/Debit Card (Stripe)' && (
              <div
                key={option.name}
                style={{
                  background: '#f4f7fa',
                  borderRadius: 10,
                  padding: 12,
                  textAlign: 'center',
                  boxShadow: '0 1px 6px #aaa2',
                }}
              >
                <div style={{ minHeight: 88, marginBottom: 10 }}>
                  {option.qrImage && (
                    <Image
                      src={option.qrImage}
                      alt={`${option.name} QR`}
                      width={88}
                      height={88}
                      style={{ borderRadius: 8 }}
                    />
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{option.name}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 5 }}>{option.description}</div>
                {option.link && (
                  <a
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: 8,
                      fontSize: 14,
                      color: '#0af',
                      fontWeight: 500,
                    }}
                  >
                    Open
                  </a>
                )}
              </div>
            )
          )}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: 8,
              padding: '13px 30px',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 2px 8px #2563eb44',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={onStripePay}
          >
            Pay by Credit/Debit Card
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            margin: '0 auto',
            display: 'block',
            color: '#64748b',
            background: 'transparent',
            border: 'none',
            fontSize: 17,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >Cancel</button>
      </div>
    </div>
  );
};

export default PaymentOptionsModal;
