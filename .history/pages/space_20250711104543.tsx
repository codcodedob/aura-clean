import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";

// Modal prompting login/signup
function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, maxWidth: 400, width: "100%" }}>
        <h2>Please log in or sign up</h2>
        <button style={{ marginTop: 24, width: "100%" }} onClick={onClose}>Demo: Close</button>
      </div>
    </div>
  );
}

// Modal confirming deletion
function ConfirmDeleteModal({
  onClose,
  onConfirm,
  deleting,
}: {
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 420, width: "100%" }}>
        <h2 style={{ color: "#b91c1c" }}>Confirm Account Deletion</h2>
        <p style={{ margin: "12px 0" }}>
          Warning: You are about to permanently delete your account and all associated data. This action <strong>cannot</strong> be undone.
        </p>
        <p style={{ margin: "12px 0" }}>
          To confirm, type <code>DELETE</code> below:
        </p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              background: "#e5e7eb",
              border: "none",
              padding: "8px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={text !== "DELETE" || deleting}
            style={{
              background: text === "DELETE" && !deleting ? "#ef4444" : "#fca5a5",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 4,
              cursor:
                text === "DELETE" && !deleting ? "pointer" : "not-allowed",
            }}
          >
            {deleting ? "Deleting…" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Space() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setActivities(data ?? []));
    }
  }, [user]);

  function requireAuth(action: () => void) {
    if (!user) setShowAuth(true);
    else action();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    // This requires a serverless function to avoid exposing service role key:
    const res = await fetch("/api/delete-account", {
      method: "POST",
    });
    if (res.ok) {
      await supabase.auth.signOut();
      router.push("/");
    } else {
      alert("Error deleting account.");
      setDeleting(false);
    }
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 20 }}>Your Space</h1>

      {/* ... other sections ... */}

      {/* Account Management */}
      <section>
        <h2>Account Management</h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, maxWidth: 400 }}>
          {user ? (
            <>
              <div><b>Email:</b> {user.email}</div>
              <button style={{ marginTop: 18 }} onClick={() => supabase.auth.signOut()}>
                Log Out
              </button>
              <button
                style={{ marginTop: 12, background: "#ef4444", color: "#fff" }}
                onClick={() => setShowConfirmDelete(true)}
              >
                Delete Account
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)}>
              Log in or Sign up
            </button>
          )}
        </div>
      </section>

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showConfirmDelete && (
        <ConfirmDeleteModal
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={handleDeleteAccount}
          deleting={deleting}
        />
      )}
    </div>
  );
}
