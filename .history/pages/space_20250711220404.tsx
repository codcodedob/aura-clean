// pages/space.tsx
import React, { useEffect, useState, useRef, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

// Pyramid slice component: renders one triangular face split vertically by completion %
function PyramidSlice({
  index,
  totalSlices,
  projectScope,
  label,
}: {
  index: number;
  totalSlices: number;
  projectScope: number; // 0 to 100
  label: string;
}) {
  // Convert projectScope % to normalized 0-1
  const completionRatio = Math.min(Math.max(projectScope / 100, 0), 1);

  // Calculate the angle for this slice on pyramid base circle
  const angleStep = (Math.PI * 2) / totalSlices;
  const angleStart = angleStep * index;
  const angleEnd = angleStep * (index + 1);

  // Pyramid height
  const height = 2;
  const radius = 1.5;

  // Vertices for the triangular slice base on XZ plane
  const v0 = new THREE.Vector3(0, height, 0); // pyramid apex at top center
  const v1 = new THREE.Vector3(
    Math.cos(angleStart) * radius,
    0,
    Math.sin(angleStart) * radius
  );
  const v2 = new THREE.Vector3(
    Math.cos(angleEnd) * radius,
    0,
    Math.sin(angleEnd) * radius
  );

  // We will create two meshes per slice:
  // 1. Complete portion: lower part of the triangle from base to completionRatio height
  // 2. Incomplete portion: from completionRatio height to apex

  // For simplicity, split the triangular face horizontally at the completion height:
  // So we interpolate new vertices along the edges v0->v1 and v0->v2 for the split line

  // Split Y height of the slice:
  const splitY = height * (1 - completionRatio);

  // Interpolated points on edges v0->v1 and v0->v2 at splitY
  const lerpVertex = (a: THREE.Vector3, b: THREE.Vector3, y: number) => {
    // Interpolate along line a->b to find point at y
    // Formula: p = a + t*(b - a)
    // solve for t: a.y + t*(b.y - a.y) = y => t = (y - a.y)/(b.y - a.y)
    const t = (y - a.y) / (b.y - a.y);
    return new THREE.Vector3(
      a.x + t * (b.x - a.x),
      y,
      a.z + t * (b.z - a.z)
    );
  };

  const splitV1 = lerpVertex(v0, v1, splitY);
  const splitV2 = lerpVertex(v0, v2, splitY);

  // Complete portion geometry (base triangle from v1,v2 and splitV2,splitV1)
  // Construct two triangles to cover that quadrilateral area:
  // triangle 1: v1, v2, splitV2
  // triangle 2: v1, splitV2, splitV1

  // Incomplete portion geometry (top triangle from v0, splitV1, splitV2)

  // Complete geometry vertices
  const completeVertices = new Float32Array([
    v1.x, v1.y, v1.z,
    v2.x, v2.y, v2.z,
    splitV2.x, splitV2.y, splitV2.z,

    v1.x, v1.y, v1.z,
    splitV2.x, splitV2.y, splitV2.z,
    splitV1.x, splitV1.y, splitV1.z,
  ]);

  // Incomplete geometry vertices
  const incompleteVertices = new Float32Array([
    v0.x, v0.y, v0.z,
    splitV1.x, splitV1.y, splitV1.z,
    splitV2.x, splitV2.y, splitV2.z,
  ]);

  // Create geometries
  const completeGeom = new THREE.BufferGeometry();
  completeGeom.setAttribute("position", new THREE.BufferAttribute(completeVertices, 3));
  completeGeom.computeVertexNormals();

  const incompleteGeom = new THREE.BufferGeometry();
  incompleteGeom.setAttribute("position", new THREE.BufferAttribute(incompleteVertices, 3));
  incompleteGeom.computeVertexNormals();

  // Hover state for color change
  const [hovered, setHovered] = React.useState(false);

  // Label position: midpoint between splitV1 and splitV2, raised a bit above base
  const labelPos = new THREE.Vector3().addVectors(splitV1, splitV2).multiplyScalar(0.5);
  labelPos.y = 0.15;

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Complete portion - electric blue */}
      <mesh geometry={completeGeom}>
        <meshStandardMaterial
          color={hovered ? "#00ffff" : "#00bcd4"}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Incomplete portion - darker blue */}
      <mesh geometry={incompleteGeom}>
        <meshStandardMaterial
          color={hovered ? "#004f6f" : "#003340"}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Label with enteractive name and % */}
      <mesh position={labelPos}>
        <Html distanceFactor={10} center>
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              pointerEvents: "none",
              userSelect: "none",
              textAlign: "center",
              textShadow: "0 0 4px black"
            }}
          >
            {label} <br />
            {projectScope.toFixed(1)}%
          </div>
        </Html>
      </mesh>
    </group>
  );
}

// Helper to render HTML in Three.js scene labels
import { Html } from "@react-three/drei";

function EnteractivePyramid({ enteractives }: { enteractives: { id: string; name: string; project_scope: number }[] }) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate the pyramid slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Canvas style={{ width: "100%", height: 400 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <group ref={groupRef}>
        {enteractives.map((e, i) => (
          <PyramidSlice
            key={e.id}
            index={i}
            totalSlices={enteractives.length}
            projectScope={e.project_scope ?? 0}
            label={e.name}
          />
        ))}
      </group>
    </Canvas>
  );
}

export default function Space() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [enteractives, setEnteractives] = useState<{ id: string; name: string; project_scope: number }[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isExecutive, setIsExecutive] = useState(false);

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

  useEffect(() => {
    // Load enteractives with project_scope
    supabase
      .from("enteractive")
      .select("id, name, project_scope")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading enteractives:", error);
          return;
        }
        if (data) {
          setEnteractives(data);
        }
      });
  }, []);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("companies")
      .select("id")
      .eq("name", "dobe")
      .or(`primary_exec.eq.${user.id},executives.cs."{${user.id}}"`)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Exec check error:", error);
          return;
        }
        if (data) setIsExecutive(true);
      });
  }, [user]);

  function requireAuth(action: () => void) {
    if (!user) setShowAuth(true);
    else action();
  }

  function handleDeleteAccount() {
    alert("Delete account: (not implemented)");
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Pyramid on top */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
        <EnteractivePyramid enteractives={enteractives} />
      </div>

      {/* Text summary below pyramid */}
      <section style={{ marginBottom: 32 }}>
        <h2>Department Completion Status</h2>
        <table style={{ width: "100%", maxWidth: 600, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "8px" }}>Department</th>
              <th style={{ padding: "8px" }}>Complete %</th>
              <th style={{ padding: "8px" }}>Incomplete %</th>
            </tr>
          </thead>
          <tbody>
            {enteractives.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{e.name}</td>
                <td style={{ padding: "8px", color: "#00bcd4", fontWeight: "bold" }}>
                  {e.project_scope?.toFixed(1) ?? 0}%
                </td>
                <td style={{ padding: "8px", color: "#666" }}>
                  {(100 - (e.project_scope ?? 0)).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* The rest of your unchanged space page content */}
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 20 }}>Your Space</h1>

      {/* Admin Button for Executives */}
      {isExecutive && (
        <button
          onClick={() => window.location.assign("/admin/dashboard")}
          style={{
            background: "#111",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 24,
            cursor: "pointer"
          }}
        >
          Go to Admin Dashboard
        </button>
      )}

      {/* Onboarding Progress */}
      <section style={{ marginBottom: 32 }}>
        <h2>Onboarding Progress</h2>
        {["Art", "Entertainment", "Cuisine", "Fashion", "Health", "Science"].map((dept) => (
          <div key={dept} style={{ margin: "8px 0" }}>
            <span>{dept}</span>
            <div style={{
              height: 10, background: "#e5e7eb", borderRadius: 6, marginTop: 2,
              width: "100%", maxWidth: 400
            }}>
              <div style={{
                width: `${Math.floor(Math.random() * 100)}%`,
                background: "#3b82f6", height: "100%", borderRadius: 6
              }} />
            </div>
          </div>
        ))}
      </section>

      {/* Life Suite */}
      <section style={{ marginBottom: 32 }}>
        <h2>Life Suite: ArcSession Halogen</h2>
        <div style={{
          background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px #0af2"
        }}>
          <p>Collect and visualize your health/life data here. (Demo stub)</p>
          <button onClick={() => requireAuth(() => alert("Open health data panel"))}>
            Connect Health Data
          </button>
        </div>
      </section>

      {/* Communications */}
      <section style={{ marginBottom: 32 }}>
        <h2>Halo Range: Communications & Groups</h2>
        <div style={{
          background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px #0af2"
        }}>
          <p>Create or join chat groups for family, work, friends, gifting, and more.</p>
          <button onClick={() => requireAuth(() => window.location.assign("/inbox"))}>
            Go to Messaging & Groups
          </button>
        </div>
      </section>

      {/* Activities */}
      <section style={{ marginBottom: 32 }}>
        <h2>Your Activities</h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, maxHeight: 300, overflowY: "auto" }}>
          {user ? (
            activities.length ? (
              activities.slice(0, 8).map((a) => (
                <div key={a.id} style={{ borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
                  <div>
                    <b>Type:</b> {a.type} &nbsp;
                    <b>Status:</b> {a.status} &nbsp;
                    <b>State:</b> {a.state}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>{a.detail || "No detail"}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {a.activityStartTimestamp
                      ? new Date(a.activityStartTimestamp).toLocaleString()
                      : ""}
                  </div>
                </div>
              ))
            ) : <p>No recent activity.</p>
          ) : <button onClick={() => setShowAuth(true)}>Log in to view activities</button>}
        </div>
      </section>

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
                onClick={() => requireAuth(handleDeleteAccount)}
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

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
