import React, { useRef, useState } from 'react';

interface PendingPaymentModalProps {
  amount: number;
  paymentMethod: string;
  onClose: () => void;
  referenceId?: string;
  onScreenshotUpload?: (file: File) => Promise<string | null>;
}

export default function PendingPaymentModal({
  amount,
  paymentMethod,
  onClose,
  referenceId,
  onScreenshotUpload,
}: PendingPaymentModalProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setUploadStatus('Uploading...');
      // Here: upload and optionally OCR
      if (onScreenshotUpload) {
        const result = await onScreenshotUpload(file);
        setUploadStatus(result ? result : 'Uploaded!');
      } else {
        setUploadStatus('Uploaded! (Pending manual review)');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#181825',
          color: '#fff',
          borderRadius: 14,
          padding: 32,
          boxShadow: '0 2px 24px #0af3',
          maxWidth: 420,
          width: '90%',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#ffce4e', marginBottom: 10 }}>🕒 Payment Pending</h2>
        <p style={{ marginBottom: 16, color: '#fff' }}>
          Your <b>{paymentMethod}</b> payment of <b>${amount.toFixed(2)}</b> is pending review.
        </p>
        {referenceId && (
          <div style={{ marginBottom: 16 }}>
            <small>Reference ID: <b>{referenceId}</b></small>
          </div>
        )}

        <div style={{
          background: '#222',
          padding: 14,
          borderRadius: 10,
          marginBottom: 18,
        }}>
          <p style={{ color: '#aaa', marginBottom: 8 }}>
            Optionally, upload a screenshot of your payment for faster review:
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: 8, color: '#fff', width: '100%' }}
          />
          {uploadStatus && <div style={{ color: '#0af', marginTop: 6 }}>{uploadStatus}</div>}
        </div>

        <div
          style={{
            marginBottom: 20,
            color: '#aaa',
            fontSize: 15,
            background: '#222',
            padding: 10,
            borderRadius: 8,
          }}
        >
          Please allow our team to verify your payment. Once confirmed, your receipt will be issued and your purchase finalized.<br />
          <br />
          <b>You’ll receive an email and a notification here when it’s complete.</b>
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#0af',
            color: '#000',
            padding: '10px 24px',
            borderRadius: 8,
            fontWeight: 'bold',
            border: 'none',
            fontSize: 17,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
