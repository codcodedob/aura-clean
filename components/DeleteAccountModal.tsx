import React, { useState } from "react";

interface DeleteAccountModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({ onCancel, onConfirm }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const isDeleteTyped = confirmText.trim().toLowerCase() === "delete";

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          width: 360,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <h3>Are you sure you want to delete your account?</h3>
        <p style={{ fontSize: 14, color: "#666", marginTop: 10 }}>
          This action cannot be undone.
          <br />
          Please type <b>delete</b> to confirm.
        </p>

        <input
          type="text"
          placeholder='Type "delete" here to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            borderRadius: 6,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isDeleteTyped}
            style={{
              background: isDeleteTyped ? "#ef4444" : "#fca5a5",
              color: "#fff",
              padding: "8px 16px",
              cursor: isDeleteTyped ? "pointer" : "not-allowed",
              border: "none",
              borderRadius: 6,
              transition: "background-color 0.3s",
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
