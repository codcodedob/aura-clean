"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number; // percentage 0-100
  link: string; // video URL (optional)
};

type EnteractivePyramidProps = {
  data: EnteractiveItem[];
  width: number;
  height: number;
};

function Bar({
  position,
  scale,
  color,
  label,
  percentage,
  videoUrl,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  label: string;
  percentage: number;
  videoUrl?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.play().catch(() => {
        // ignore play error on autoplay
      });
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      setVideoTexture(texture);

      return () => {
        texture.dispose();
        video.pause();
        video.src = "";
      };
    }
  }, [videoUrl]);

  useEffect(() => {
    if (hovered && meshRef.current) {
      gsap.to(meshRef.current.scale, { y: scale[1] * 1.2, duration: 0.3 });
    } else if (meshRef.current) {
      gsap.to(meshRef.current.scale, { y: scale[1], duration: 0.3 });
    }
  }, [hovered, scale]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={color} />
        )}
      </mesh>

      {/* Label above bar */}
      <Html position={[0, scale[1] / 2 + 0.2, 0]} center>
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "2px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            userSelect: "none",
            cursor: "default",
            fontSize: 12,
          }}
          title={`${label} - ${percentage.toFixed(1)}%`}
        >
          {label}: {percentage.toFixed(1)}%
        </div>
      </Html>
    </group>
  );
}

function PyramidGroup({ data }: { data: EnteractiveItem[] }) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate pyramid slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  // Arrange bars in a pyramid style
  // We space bars on x and z axes in layers: bottom layer biggest row, upper smaller
  const bars = [];
  const baseY = 0;
  const barWidth = 1;
  //const barSpacing = 1.2;

  // For simplicity, place all bars in a circle or a grid around center
  const angleStep = (2 * Math.PI) / data.length;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const angle = i * angleStep;
    const radius = 4;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    // height scaled to project_scope percentage (max 5 units height)
    const height = (item.project_scope / 100) * 5 || 0.1;

    // Color: green if high completion, red if low
    const color = `hsl(${(item.project_scope / 100) * 120}, 80%, 50%)`;

    bars.push(
      <Bar
        key={item.id}
        position={[x, baseY + height / 2, z]}
        scale={[barWidth, height, barWidth]}
        color={color}
        label={item.name}
        percentage={item.project_scope}
        videoUrl={item.link && item.link.length > 5 ? item.link : undefined}
      />
    );
  }

  return <group ref={groupRef}>{bars}</group>;
}

export default function EnteractivePyramid({ data, width, height }: EnteractivePyramidProps) {
  return (
    <div style={{ width, height, background: "#111", borderRadius: 12, position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <PyramidGroup data={data} />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontWeight: 600,
          color: "white",
          userSelect: "none",
          pointerEvents: "none",
          fontSize: 14,
        }}
      >
        Enteractive Pyramid — Rotate to explore
      </div>
    </div>
  );
}
