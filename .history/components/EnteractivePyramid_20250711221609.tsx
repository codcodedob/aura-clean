// components/EnteractivePyramid.tsx
import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Text, OrbitControls } from "@react-three/drei";

export type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number; // percentage 0-100
  link: string;
};

interface EnteractivePyramidProps {
  data: EnteractiveItem[];
  width?: number;
  height?: number;
}

function PyramidBar({
  position,
  height,
  color,
  label,
}: {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Billboard effect: make label always face camera
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Bar */}
      <Box args={[0.8, height, 0.8]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Label */}
      <Text
        position={[0, height + 0.2, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>
    </group>
  );
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate entire group slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function EnteractivePyramid({
  data,
  width = 800,
  height = 400,
}: EnteractivePyramidProps) {
  // Layout constants
  const barSpacing = 1.5;
  const maxBarHeight = 5;
  const minBarHeight = 0.2;

  return (
    <div style={{ width, height, margin: "auto" }}>
      <Canvas camera={{ position: [0, 6, 12], fov: 50 }} style={{ background: "#111" }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={1} />

        <RotatingGroup>
          {data.map((item, i) => {
            const barHeight = Math.max((item.project_scope / 100) * maxBarHeight, minBarHeight);
            const color = `hsl(${(item.project_scope / 100) * 120}, 80%, 50%)`;
            const label = `${item.name} - ${item.project_scope.toFixed(1)}%`;

            return (
              <PyramidBar
                key={item.id}
                position={[i * barSpacing, 0, 0]}
                height={barHeight}
                color={color}
                label={label}
              />
            );
          })}
        </RotatingGroup>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
