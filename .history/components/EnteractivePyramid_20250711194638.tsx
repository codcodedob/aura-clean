"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Group, Color } from "three";
import { Html } from "@react-three/drei";

interface Props {
  projectScope: number | null;
  label: string;
  videoUrl?: string;
}

export default function EnteractivePyramid({ projectScope, label, videoUrl }: Props) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <div style={{ width: "220px", height: "220px" }}>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <group ref={groupRef}>
          <mesh>
            <coneGeometry args={[1, 1.5, 4]} />
            <meshStandardMaterial color={new Color("purple")} />
          </mesh>
          <Html center>
            <div
              style={{
                background: "rgba(0,0,0,0.6)",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: "0.8rem",
                color: "#fff"
              }}
            >
              {label} – {(projectScope ?? 0).toFixed(1)}%
            </div>
          </Html>
        </group>
      </Canvas>
    </div>
  );
}
