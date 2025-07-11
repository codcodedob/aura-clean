"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

// List your 3D items (could be dynamic from API, or hardcoded for now)
const CLOSET_MODELS = [
  "shirt.glb",
  "pants.glb",
  "jacket.glb",
  "dress.glb",
  "shoes.glb",
  "dollar_stack.glb",
  "lightning.glb",
  // Add more as needed
];

const CART_MODELS = [
  "dollar_stack.glb", // Example for "cart"
  "shirt.glb", // Show a couple items as if they're in the cart
];

function MagneticGroup({
  mainModel = "xtime.glb",
  itemModels = [],
  mouse,
}: {
  mainModel: string;
  itemModels: string[];
  mouse: THREE.Vector2;
}) {
  const group = useRef<THREE.Group>(null!);
  const mainRef = useRef<any>(null!);
  const itemRefs = useRef<any[]>([]);

  // Main object
  const main = useGLTF(`/models/${mainModel}`);

  // Load all item models
  const loadedItems = useMemo(
    () =>
      itemModels.map((filename) => ({
        gltf: useGLTF(`/models/${filename}`),
        filename,
      })),
    [itemModels]
  );

  // Set initial positions
  const initialPositions = useMemo(
    () =>
      itemModels.map((_, i) => {
        const angle = (i / itemModels.length) * Math.PI * 2;
        const radius = 2 + Math.random() * 2;
        return [
          Math.cos(angle) * radius,
          Math.random() * 1.2 - 0.6,
          Math.sin(angle) * radius,
        ];
      }),
    [itemModels]
  );

  // Per frame: magnetic motion
  useFrame((state) => {
    const pointer = mouse;
    // Get main object world pos
    const mainPos = new THREE.Vector3();
    mainRef.current.getWorldPosition(mainPos);

    loadedItems.forEach((item, i) => {
      const mesh = itemRefs.current[i];
      if (!mesh) return;
      // Current position
      const pos = mesh.position;
      // Direction to main object
      const dir = mainPos.clone().sub(pos).normalize();
      // Distance to main object
      const dist = pos.distanceTo(mainPos);

      // Mouse repulsion
      const mouse3 = new THREE.Vector3(pointer.x * 5, 0, pointer.y * 5);
      const toMouse = pos.clone().sub(mouse3);
      const mouseDist = toMouse.length();
      let force = dir.multiplyScalar(0.03 * dist);
      if (mouseDist < 2.5) {
        force.add(toMouse.normalize().multiplyScalar((2.5 - mouseDist) * 0.19));
      }
      // Lerp to target
      pos.add(force);

      // Apply gentle randomness so they're never static
      pos.x += (Math.random() - 0.5) * 0.01;
      pos.y += (Math.random() - 0.5) * 0.007;

      // Optionally, slow return when user moves mouse away
      // Optionally, clamp max distance
    });
  });

  return (
    <group ref={group}>
      {/* Main magnetic "sun" object */}
      <primitive
        object={main.scene}
        ref={mainRef}
        scale={1.6}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />
      {/* Item objects */}
      {loadedItems.map((item, i) => (
        <primitive
          key={item.filename}
          object={item.gltf.scene}
          ref={(el) => (itemRefs.current[i] = el)}
          position={initialPositions[i]}
          scale={0.78}
          castShadow
          receiveShadow
        >
          {/* You can overlay 3D labels or UI here */}
        </primitive>
      ))}
    </group>
  );
}

// Main 3D Scene Wrapper
export default function GravityScene({
  mode = "closet", // "cart" or "closet"
}: {
  mode?: "cart" | "closet";
}) {
  const [mouse, setMouse] = useState<THREE.Vector2>(new THREE.Vector2());

  // Toggle between cart/closet
  const items = mode === "cart" ? CART_MODELS : CLOSET_MODELS;

  // Handle mousemove globally
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // Normalize to -1...1 range for the scene
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse(new THREE.Vector2(x, y));
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div style={{ width: "100%", height: "430px", background: "#151a21", borderRadius: 18, boxShadow: "0 8px 44px #0af3", margin: "0 auto" }}>
      <Canvas camera={{ position: [0, 3.2, 8], fov: 44 }}>
        <ambientLight intensity={0.67} />
        <pointLight position={[0, 5, 7]} intensity={1.1} castShadow />
        <MagneticGroup mainModel="xtime.glb" itemModels={items} mouse={mouse} />
        <OrbitControls enableZoom={true} enablePan={false} minPolarAngle={0.95} maxPolarAngle={2.45} />
      </Canvas>
    </div>
  );
}
