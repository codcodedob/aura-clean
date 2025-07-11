import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const [signupMode, setSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    // 1) Create supabase auth user
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Wait for user to be created, may need to confirm email in production

    // 2) Call backend API to create Stripe customer + insert users row
    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId: data.user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");
    } catch (e: any) {
      setError("Failed to create Stripe user: " + e.message);
      setLoading(false);
      return;
    }

    alert("Account created! Please check your email to confirm and then login.");
    setSignupMode(false);
    setLoading(false);
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user)
    return (
      <div style={{ padding: 20 }}>
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );

  return (
    <div style={{ maxWidth: 360, margin: "2rem auto", padding: 20, background: "#222", borderRadius: 8, color: "#fff" }}>
      <h2>{signupMode ? "Create Account" : "Login"}</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement).value;
          const password = (form.elements.namedItem("password") as HTMLInputElement).value;

          if (signupMode) {
            await handleSignup(email, password);
          } else {
            await handleLogin(email, password);
          }
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 4, border: "none" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 4, border: "none" }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, borderRadius: 4, background: "#0af", color: "#000", fontWeight: "bold" }}>
          {loading ? "Please wait..." : signupMode ? "Create Account" : "Login"}
        </button>
      </form>
      <button
        onClick={() => {
          setError("");
          setSignupMode(!signupMode);
        }}
        style={{ marginTop: 12, background: "transparent", color: "#0af", border: "none", cursor: "pointer" }}
      >
        {signupMode ? "← Back to Login" : "Need an account? Sign Up"}
      </button>
      {error && <div style={{ marginTop: 12, color: "#f33" }}>{error}</div>}
    </div>
  );
}
