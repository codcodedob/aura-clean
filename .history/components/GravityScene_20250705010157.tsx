// components/GravityScene.tsx
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

type GravitySceneProps = {
  mode: "cart" | "closet";
};

function Sun() {
  // Main object - XTime
  const { scene } = useGLTF("/models/xtime.glb");
  return <primitive object={scene} scale={2.2} />;
}

function Lightning() {
  // Simple 3D bolt as a stand-in, could load a real model here
  return (
    <mesh position={[0, 2.3, 0]} rotation={[0, 0, Math.PI / 8]}>
      <cylinderGeometry args={[0.09, 0.05, 1.1, 8]} />
      <meshStandardMaterial color="#f8dd19" emissive="#fff700" emissiveIntensity={1.2} />
    </mesh>
  );
}

function DollarStack({ position, scale }: { position: [number, number, number], scale: number }) {
  // Cube to represent stack of bills
  return (
    <mesh position={position} scale={[1.8 * scale, 0.25 * scale, 0.9 * scale]}>
      <boxGeometry />
      <meshStandardMaterial color="#4caf50" />
    </mesh>
  );
}

// All "planets" = clothing .glb's
const clothingModels = [
  "/models/top.glb",
  "/models/bottom.glb",
  "/models/base-inner.glb",
  "/models/base-outer.glb",
];

function Planet({ url, index, total, mouse, attract }: {
  url: string;
  index: number;
  total: number;
  mouse: THREE.Vector2;
  attract: boolean;
}) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  // Each planet has an angle around sun
  const angle = (index / total) * Math.PI * 2;
  const radiusBase = 3.7;

  useFrame(() => {
    if (!ref.current) return;
    // Mouse repel force
    let dx = Math.cos(angle);
    let dz = Math.sin(angle);
    let mag = 1;
    if (attract) {
      // Mouse not over: planets return to sun
      ref.current.position.x += (-radiusBase * dx - ref.current.position.x) * 0.04;
      ref.current.position.z += (-radiusBase * dz - ref.current.position.z) * 0.04;
    } else {
      // Mouse over: fly outward in direction
      ref.current.position.x += ((radiusBase + 2.5) * dx - ref.current.position.x) * 0.15;
      ref.current.position.z += ((radiusBase + 2.5) * dz - ref.current.position.z) * 0.15;
    }
    ref.current.position.y += (0.5 * Math.sin(angle * 1.7) - ref.current.position.y) * 0.09;
    ref.current.rotation.y += 0.007 + 0.003 * index;
  });

  return <primitive object={scene} ref={ref} scale={1.1} />;
}

export default function GravityScene({ mode }: GravitySceneProps) {
  const [hovering, setHovering] = useState(false);
  const [mouse, setMouse] = useState<THREE.Vector2>(new THREE.Vector2());

  // -- handle mouse movement (canvas only) --
  const handlePointerMove = (e: any) => {
    setMouse(new THREE.Vector2(e.unprojectedPoint.x, e.unprojectedPoint.y));
    setHovering(true);
  };
  const handlePointerOut = () => setHovering(false);

  // Dynamically swap planet sets
  const models = useMemo(() => {
    if (mode === "cart") {
      // Cart: stacks of money, lightning, clothing
      return [
        ...clothingModels,
        "stack", // will render DollarStack
        "bolt"   // will render Lightning
      ];
    }
    // Closet: only clothing
    return clothingModels;
  }, [mode]);

  return (
    <div style={{ width: "100%", height: 440 }}>
      <Canvas camera={{ position: [0, 3.5, 10], fov: 42 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[7, 7, 6]} intensity={1.2} castShadow />
        <group position={[0, 0.1, 0]}>
          {/* Sun */}
          <Sun />
          {/* Dollar stacks / Lightning / Clothing planets */}
          {models.map((m, i) =>
            m === "stack" ? (
              <DollarStack key={i} position={[2.9, -0.6, 0]} scale={1.18} />
            ) : m === "bolt" ? (
              <Lightning key={i} />
            ) : (
              <Planet
                key={m}
                url={m}
                index={i}
                total={models.length}
                mouse={mouse}
                attract={!hovering}
              />
            )
          )}
        </group>
        {/* Nice HDR + controls */}
        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={18}
          enableDamping
        />
        {/* Track mouse */}
        <mesh
          position={[0, 0, 0]}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          visible={false}
        >
          <planeGeometry args={[22, 22]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </div>
  );
}

// Required for drei useGLTF
useGLTF.preload("/models/xtime.glb");
clothingModels.forEach((m) => useGLTF.preload(m));
