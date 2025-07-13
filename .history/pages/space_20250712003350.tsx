// app/space.tsx
"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

interface EnteractiveRecord {
  id: number;
  name: string;
  description: string;
  img_url: string;
  link: string;
  is_active: boolean;
  progress: number;
  project_scope: number;
  created_at: string;
}

export default function Space() {
  const [enteractives, setEnteractives] = useState<EnteractiveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEnteractives = async () => {
      const { data, error } = await supabase
        .from("enteractive")
        .select("*");

      if (error) {
        console.error("Error fetching enteractives:", error);
        return;
      }

      if (data) {
        setEnteractives(data as EnteractiveRecord[]);
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

      {enteractives.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          {item.img_url && (
            <img
              src={item.img_url}
              alt={item.name}
              style={{ width: "100%", borderRadius: 4, marginBottom: 8 }}
            />
          )}

          {/* Progress Bar */}
          <div style={{ margin: "8px 0" }}>
            <div
              style={{
                background: "#eee",
                height: 10,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${item.progress}%`,
                  background: "#3b82f6",
                  height: "100%",
                  borderRadius: 6,
                }}
              />
            </div>
            <small>{item.progress}% Complete</small>
          </div>

          {/* Video Preview */}
          {item.link && (
            <div style={{ marginTop: 12 }}>
              <video
                src={item.link}
                controls
                style={{ width: "100%", borderRadius: 4 }}
              />
            </div>
          )}
        </div>
      ))}

      {/* 3D Pyramid */}
      <div style={{ marginTop: 32 }}>
        <EnteractivePyramid
          data={enteractives.map((item) => ({
            id: String(item.id),
            name: item.name,
            project_scope: item.project_scope,
            link: item.link,
          }))}
          width={800}
          height={500}
        />
      </div>
    </div>
  );
}

// Types for the 3D Pyramid
type EnteractiveItem = {
  id: string;
  name: string;
  project_scope: number;
  link: string;
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
            fontSize: 12,
            whiteSpace: "nowrap",
            userSelect: "none",
            cursor: "default",
          }}
          title={`${label} - ${percentage?.toFixed(1) ?? "0"}%`}
        >
          {label}: {percentage?.toFixed(1) ?? "0"}%
        </div>
      </Html>
    </group>
  );
}

function PyramidGroup({ data }: { data: EnteractiveItem[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  const bars = [];
  const baseY = 0;
  const barWidth = 1;
  const angleStep = (2 * Math.PI) / data.length;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const angle = i * angleStep;
    const radius = 4;
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

export function EnteractivePyramid({ data, width, height }: EnteractivePyramidProps) {
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
