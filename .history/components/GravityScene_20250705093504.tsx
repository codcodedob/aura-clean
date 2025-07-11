"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// -- Helper: Loads a GLTF model and returns its scene
function Model({ url, ...props }: { url: string; [k: string]: any }) {
  // Memoize so models don't reload on every render
  const { scene } = useGLTF(`/models/${url}`);
  return <primitive object={scene} {...props} />;
}

// -- Main Magnetic Group (magnetic layout, main + item models) --
function MagneticGroup({
  mainModel,
  itemModels,
  mouse,
}: {
  mainModel: string;
  itemModels: string[];
  mouse: THREE.Vector2;
}) {
  const group = useRef<THREE.Group>(null!);
  // Place main model in center, others orbit with "magnetic" force

  // Magnetic positions (repel on mouse, return to base on release)
  const basePositions = useMemo(
    () =>
      itemModels.map((_, i, arr) => {
        // Spread models in a circle
        const theta = (i / arr.length) * Math.PI * 2;
        return [
          Math.cos(theta) * 2.7,
          0.3 + Math.sin(theta) * 1.1,
          Math.sin(theta) * 2.7,
        ];
      }),
    [itemModels.length]
  );

  // Animated state for orbiting items
  const [magnetic, setMagnetic] = useState(0);

  useFrame(() => {
    // Animate "magnetic" intensity based on mouse proximity to center
    const strength =
      Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y) > 0.07
        ? 1
        : 0; // If mouse is off center, magnetic
    setMagnetic((m) => m * 0.9 + strength * 0.15); // spring

    // Animate child positions
    if (group.current) {
      group.current.children.forEach((obj, idx) => {
        if (idx === 0) return; // skip main model
        const mesh = obj as THREE.Object3D;
        const [bx, by, bz] = basePositions[idx - 1] ?? [0, 0, 0];

        // Calculate "magnetic" offset based on mouse
        const mx = mouse.x * 7 * magnetic;
        const mz = mouse.y * 7 * magnetic;
        mesh.position.x += ((bx + mx) - mesh.position.x) * 0.18;
        mesh.position.y += (by - mesh.position.y) * 0.18;
        mesh.position.z += ((bz + mz) - mesh.position.z) * 0.18;
      });
    }
  });

  return (
    <group ref={group}>
      {/* Main "magnet" object */}
      <Model url={mainModel} scale={1.14} position={[0, 0.3, 0]} />
      {/* Orbiting item models */}
      {itemModels.map((file, idx) => (
        <Model key={file} url={file} scale={1.02} />
      ))}
    </group>
  );
}

// -- Main GravityScene Component --
export default function GravityScene({
  mode = "closet", // "cart" | "closet"
  filter,
}: {
  mode?: "cart" | "closet";
  filter?: (filename: string) => boolean;
}) {
  const [models, setModels] = useState<string[]>([]);
  const [mouse, setMouse] = useState(new THREE.Vector2(0, 0));

  // Fetch available 3D model filenames
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.models)) setModels(data.models);
      })
      .catch((err) => {
        console.error("Error fetching models:", err);
      });
  }, []);

  // Mouse-magnetic logic
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse(new THREE.Vector2(x, y));
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Main magnet model
  const mainModel = "xtime.glb"; // Update as needed!
  let itemModels = models.filter((f) => f !== mainModel && f.endsWith(".glb"));
  if (filter) itemModels = itemModels.filter((name) => filter(name));
  if (mode === "cart") {
    // Example: Filter for cart items (e.g., "dollar.glb", "stack.glb", etc)
    itemModels = itemModels.filter((f) => f.includes("dollar") || f.includes("cart"));
  }

  if (!models.length)
    return (
      <div style={{ height: 440, background: "#151a21", borderRadius: 14 }}>
        Loading 3D scene...
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        height: 430,
        background: "#151a21",
        borderRadius: 18,
        boxShadow: "0 8px 44px #0af3",
        margin: "0 auto",
      }}
    >
      <Canvas camera={{ position: [0, 3.2, 8], fov: 44 }}>
        <ambientLight intensity={0.74} />
        <pointLight position={[0, 6, 7]} intensity={1.13} castShadow />
        <MagneticGroup
          mainModel={mainModel}
          itemModels={itemModels}
          mouse={mouse}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={0.95}
          maxPolarAngle={2.45}
        />
      </Canvas>
    </div>
  );
}

// Required for useGLTF to cache models (so no warnings)
useGLTF.preload("/models/xtime.glb");
