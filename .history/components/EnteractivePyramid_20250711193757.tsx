"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

interface PyramidProps {
  projectScope: number; // 0–100
  label: string;
}

export default function EnteractivePyramid({ projectScope, label }: PyramidProps) {
  const height = 2;
  const baseSize = 2;
  const scaleY = Math.max(projectScope / 100, 0.05); // avoid flat

  return (
    <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
      <Canvas style={{ height: 250 }}>
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
      <div style={{ textAlign: "center", marginTop: "0.5rem", fontWeight: 500 }}>
      {label} – {(projectScope ?? 0).toFixed(1)}%

      </div>
    </div>
  );
}
