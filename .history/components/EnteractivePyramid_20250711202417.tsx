import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number;
  link: string;
};

interface EnteractivePyramidProps {
  data: EnteractiveItem[];
  width?: number;
  height?: number;
}

export default function EnteractivePyramid({
  data,
  width = 300,
  height = 300,
}: EnteractivePyramidProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  // Simple pyramid: each bar represents an EnteractiveItem's project_scope
  const barWidth = 0.8;
  const maxHeight = 4;

  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group ref={groupRef} position={[-(data.length - 1) / 2, 0, 0]}>
          {data.map((item, i) => {
            const heightScale = (item.project_scope / 100) * maxHeight;
            return (
              <mesh key={item.id} position={[i * (barWidth + 0.3), heightScale / 2, 0]}>
                <boxGeometry args={[barWidth, heightScale, barWidth]} />
                <meshStandardMaterial
                  color={`hsl(${(item.project_scope / 100) * 120}, 100%, 50%)`}
                />
              </mesh>
            );
          })}
        </group>
      </Canvas>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        {data.map((item) => (
          <div key={item.id} style={{ fontWeight: 600 }}>
            {item.name}: {item.project_scope.toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}
