import React, { useState } from "react";

interface DobeChatModalProps {
  onClose: () => void;
}

interface ChatMessage {
  role: string;
  content: string;
}

const DobeChatModal: React.FC<DobeChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Detect if the user wants to generate an image
      if (input.trim().toLowerCase().startsWith("/img")) {
        const imagePrompt = input.replace(/^\/img\s*/i, "");
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt }),
        });

        const data = await res.json();
        if (data.imageUrl) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `<img src="${data.imageUrl}" alt="Generated" style="max-width: 100%; border-radius: 8px; box-shadow: 0 0 10px #0af4;" />`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "❌ Failed to generate image." },
          ]);
        }
        setLoading(false);
        return;
      }

      // Otherwise, normal chat message
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } 
    catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Failed to get a valid response from Dobe Research.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <strong>This is Dobe Research</strong>
        <button onClick={onClose} style={{ color: "#f87171", border: "none", background: "transparent" }}>
          ✕
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 120, maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              margin: "10px 0",
              color: msg.role === "user" ? "#fff" : "#6ee7b7",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: msg.role === "user" ? `<strong>You:</strong> ${msg.content}` : `<strong>Dobe:</strong> ${msg.content}` }}
          />
        ))}
        {loading && (
          <div style={{ color: "#aef", fontStyle: "italic", marginTop: 8 }}>
            <strong>Dobe:</strong> Thinking...
          </div>
        )}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage();
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type message, or "/img cat astronaut"'
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1f2937",
            color: "#fff",
            fontSize: 15,
          }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
      <div style={{ fontSize: 12, color: "#bbb", marginTop: 8 }}>
        <span>Try <b>/img</b> for images</span>
      </div>
    </div>
  );
};

export default DobeChatModal;
