import React, { useState } from "react";

interface DobeChatModalProps {
  onClose: () => void;
}

const DobeChatModal: React.FC<DobeChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        right: 100,
        width: 360,
        maxHeight: "60vh",
        background: "#111827",
        color: "#fff",
        borderRadius: 14,
        boxShadow: "0 0 24px #0af4",
        padding: 16,
        zIndex: 10000,
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <strong>This is Dobe Research</strong>
        <button onClick={onClose} style={{ color: "#f87171", border: "none", background: "transparent" }}>
          ✕
        </button>
      </div>

      <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "6px 0", color: msg.role === "user" ? "#fff" : "#6ee7b7" }}>
            <strong>{msg.role === "user" ? "You" : "Dobe"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1f2937",
            color: "#fff",
          }}
        />
      </form>
    </div>
  );
};

export default DobeChatModal;
