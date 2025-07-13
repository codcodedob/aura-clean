import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EnteractivePyramidProps } from "@/types/supabase"; // adjust path

export default function EnteractivePyramid({
  data,
  width,
  height,
}: EnteractivePyramidProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  // Divide the pyramid into slices based on data length
  const sliceCount = data.length;
  const anglePerSlice = (2 * Math.PI) / sliceCount;
  const radius = 2;
  const maxHeight = 4;

  return (
    <div style={{ width, height, margin: "0 auto" }}>
      <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={0.8} />
        <group ref={groupRef} position={[0, 0, 0]}>
          {data.map((item, i) => {
            // height based on project_scope percentage
            const barHeight = (item.project_scope / 100) * maxHeight;

            // Color from red (low) to green (high)
            const color = new THREE.Color().setHSL(
              (item.project_scope / 100) * 0.4, // green hues
              0.8,
              0.5
            );

            // Position on circle
            const x = radius * Math.cos(i * anglePerSlice);
            const z = radius * Math.sin(i * anglePerSlice);

            return (
              <mesh
                key={item.id}
                position={[x, barHeight / 2, z]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.5, barHeight, 0.5]} />
                <meshStandardMaterial color={color} />
                {/* Optional: Add 3D Text or other elements */}
              </mesh>
            );
          })}
        </group>
      </Canvas>
      <div style={{ textAlign: "center", marginTop: 12, fontWeight: 600 }}>
        {data.map((item) => (
          <div key={item.id} style={{ marginBottom: 4 }}>
            {item.name}: {item.project_scope.toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}
