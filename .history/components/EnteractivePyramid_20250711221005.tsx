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

  // Billboard effect: label always faces the camera
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* The bar */}
      <Box args={[0.8, height, 0.8]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </Box>

      {/* Label above the bar */}
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="bottom"
        maxWidth={2}
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

  // Rotate entire pyramid group slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  const barSpacing = 1.6;
  const maxBarHeight = 5;
  const minBarHeight = 0.3;

  return (
    <div style={{ width, height, margin: "auto" }}>
      <Canvas camera={{ position: [0, 6, 12], fov: 50 }} style={{ background: "#111" }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={1} />

        <group
          ref={groupRef}
          p
