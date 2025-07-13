import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, Text, OrbitControls } from "@react-three/drei";

type EnteractiveItem = {
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

  // Billboard effect: rotate text to always face camera
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

      {/* Label above bar */}
      <Text
        position={[0, height + 0.2, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="bottom"
        maxWidth={2}
        // Optionally make text a bit bolder
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>
    </group>
  );
}

export default function EnteractivePyramid({
  data,
  width = 800,
  height = 400,
}: EnteractivePyramidProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate entire pyramid slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  // Constants for layout
  const barSpacing = 1.5;
  const maxBarHeight = 5;
  const minBarHeight = 0.2;

  return (
    <div style={{ width, height, margin: "auto" }}>
      <Canvas
        camera={{ position: [0, 6, 12], fov: 50 }}
        style={{ background: "#111" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <group ref={groupRef} position={[-(data.length - 1) * (barSpacing / 2), 0, 0]}>
          {data.map((item, i) => {
            // Calculate bar height with minimum threshold
            const barHeight = Math.max(
              (item.project_scope / 100) * maxBarHeight,
              minBarHeight
            );

            // Color gradient green (high) to red (low)
            const color = `hsl(${(item.project_scope / 100) * 120}, 80%, 50%)`;

            // Label with name and percentage
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
        </group>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
