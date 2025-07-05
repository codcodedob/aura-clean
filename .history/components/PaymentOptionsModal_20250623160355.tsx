import React from "react";

interface Props {
  show: boolean;
  amount?: number;
  coin?: { name: string, emoji?: string };
  onClose: () => void;
  onStripePay: () => void;
  onOtherPay: () => void;
  onFreeConfirm: () => void;
}

const PaymentOptionsModal: React.FC<Props> = ({
  show, amount, coin, onClose, onStripePay, onOtherPay, onFreeConfirm
}) => {
  if (!show) return null;

  // 0.00 purchase: hide all payment options, just show confirm
  if (amount === 0) {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Claim Free Offer</h2>
          <p>
            {coin?.emoji} <b>{coin?.name}</b>
          </p>
          <p>
            <strong>Amount:</strong> $0.00
          </p>
          <p>
            This is a giveaway, comp, or sales offer. No payment required.
          </p>
          <button onClick={onFreeConfirm} style={{ background: "#10b981", color: "#fff", padding: "10px 16px", borderRadius: 8, fontWeight: "bold", width: "100%", margin: "16px 0" }}>
            Confirm & Claim
          </button>
          <button onClick={onClose} style={{ background: "#aaa", color: "#fff", padding: "8px 12px", borderRadius: 6, width: "100%" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Normal payment (paid)
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Confirm Purchase</h2>
        <p>
          {coin?.emoji} <b>{coin?.name}</b>
        </p>
        <p>
          <strong>Amount:</strong> ${amount?.toFixed(2)}
        </p>
        <div style={{ margin: "18px 0" }}>
          <h3>Choose your payment method:</h3>
          <button onClick={onStripePay} style={{ background: "#635bff", color: "#fff", marginBottom: 10, width: "100%", borderRadius: 8, padding: "10px" }}>
            Pay with Card (Stripe)
          </button>
          <button onClick={onOtherPay} style={{ background: "#0f172a", color: "#fff", width: "100%", borderRadius: 8, padding: "10px" }}>
            Show QR / Alt Payment
          </button>
        </div>
        <button onClick={onClose} style={{ background: "#aaa", color: "#fff", padding: "8px 12px", borderRadius: 6, width: "100%" }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentOptionsModal;
