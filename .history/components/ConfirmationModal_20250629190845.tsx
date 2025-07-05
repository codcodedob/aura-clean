import React from "react"

interface ConfirmationModalProps {
  open: boolean
  title: string
  children?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open, title, children, onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel"
}) => {
  if (!open) return null
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#222", padding: 32, borderRadius: 12, minWidth: 340 }}>
        <h2 style={{ margin: 0, color: "#0af" }}>{title}</h2>
        <div style={{ margin: "24px 0" }}>{children}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, background: "#444", color: "#fff", borderRadius: 6, padding: 10 }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ flex: 1, background: "#0af", color: "#000", borderRadius: 6, padding: 10 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
