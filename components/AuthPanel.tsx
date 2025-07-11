"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your email for confirmation link.");
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else window.location.reload();
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 320,
        margin: "2rem auto",
        padding: "1rem",
        background: "#181818",
        borderRadius: 8,
        border: "1px solid #333",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Account</h2>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          disabled={loading}
          onClick={handleLogin}
          style={{
            flex: 1,
            padding: "0.5rem",
            background: "#0af",
            border: "none",
            color: "#000",
            fontWeight: "bold",
            borderRadius: 4,
          }}
        >
          Login
        </button>
        <button
          disabled={loading}
          onClick={handleSignUp}
          style={{
            flex: 1,
            padding: "0.5rem",
            background: "#555",
            border: "none",
            color: "#fff",
            borderRadius: 4,
          }}
        >
          Sign Up
        </button>
      </div>
      {message && (
        <p style={{ marginTop: "0.5rem", color: "#f66", fontSize: 14 }}>{message}</p>
      )}
    </div>
  );
}
