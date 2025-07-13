"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

interface PyramidProps {
  projectScope: number; // completion percentage (0–100)
  label: string;
}

export default function EnteractivePyramid({ projectScope, label }: PyramidProps) {
  const height = 2;
  const baseSize = 2;
  const scaleY = Math.max(projectScope / 100, 0.05); // avoid 0 height

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={<Html center>Loading...</Html>}>
          <mesh scale={[1, scaleY, 1]}>
            <coneGeometry args={[baseSize, height, 4]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
          <OrbitControls />
        </Suspense>
      </Canvas>
      <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
        <strong>{label}</strong> - {projectScope.toFixed(1)}%
      </div>
    </div>
  );
}
