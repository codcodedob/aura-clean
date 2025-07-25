import React, { useState } from "react";

interface DobeChatModalProps {
  onClose: () => void;
}

const DobeChatModal: React.FC<DobeChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<
    { role: string; content: string; imageUrl?: string }[]
  >([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // *** Check for image command ***
    const imgPrompt =
      input.startsWith("/img ")
        ? input.slice(5)
        : input.toLowerCase().startsWith("generate an image of ")
        ? input.slice(21)
        : null;

    if (imgPrompt) {
      // Call your image generation API
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Generating image..." },
      ]);
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imgPrompt }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setMessages((prev) => [
            ...prev.slice(0, -1), // Remove "Generating image..." message
            { role: "assistant", content: `Here is your image:`, imageUrl: data.imageUrl },
          ]);
        } else {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: "❌ Failed to generate image." },
          ]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "❌ Image generation failed." },
        ]);
      }
      return;
    }

    // *** Otherwise, use normal chat ***
    try {
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
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Failed to get a valid response from Dobe Research.",
        },
      ]);
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
            <strong>{msg.role === "user" ? "You" : "Dobe"}:</strong>{" "}
            {msg.imageUrl ? (
              <div>
                <img src={msg.imageUrl} alt="Generated" style={{ width: "100%", borderRadius: 10 }} />
              </div>
            ) : (
              msg.content
            )}
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
          placeholder="Ask me anything... (or type /img your prompt)"
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
