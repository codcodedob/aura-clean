"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// Type for records coming from Supabase
export type EnteractiveItem = {
  id: number;
  name: string;
  description: string;
  img_url: string;
  link: string;
  is_active: boolean;
  progress: number;
  project_scope: number;
  created_at: string;
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

  // Load video texture if URL exists
  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.play().catch(() => {});
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
      <Html position={[0, scale[1] / 2 + 0.2, 0]} center>
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "2px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            fontSize: 12,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {label}: {percentage.toFixed(1)}%
        </div>
      </Html>
    </group>
  );
}

function PyramidGroup({ data }: { data: EnteractiveItem[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const bars = [];
  const baseY = 0;
  const barWidth = 1;
  const angleStep = (2 * Math.PI) / data.length;
  const radius = 4;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const angle = i * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const height = (item.project_scope / 100) * 5 || 0.1;
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

export default function Space() {
  const [enteractives, setEnteractives] = useState<EnteractiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnteractives = async () => {
      const { data, error } = await supabase
        .from("enteractive")
        .select(
          "id, name, description, img_url, link, is_active, progress, project_scope, created_at"
        );

      if (error) {
        console.error("Error fetching enteractives:", error);
      } else if (data) {
        setEnteractives(data as EnteractiveItem[]);
      }
      setLoading(false);
    };

    fetchEnteractives();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Enteractive Progress</h1>
      {loading && <p>Loading...</p>}
      {!loading && enteractives.length === 0 && <p>No enteractives found.</p>}
      {!loading && enteractives.length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <Canvas
            shadows
            camera={{ position: [0, 8, 12], fov: 45 }}
            style={{ height: 500, borderRadius: 12 }}
          >
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            <Suspense fallback={null}>
              <PyramidGroup data={enteractives} />
            </Suspense>
            <OrbitControls enableZoom enablePan={false} maxPolarAngle={Math.PI / 2} />
          </Canvas>
          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              fontWeight: 600,
              color: "#555",
            }}
          >
            Rotate to explore bars
          </div>
        </div>
      )}
    </div>
  );
}
