"use client";

import React, { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

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
  const meshRef = React.useRef<THREE.Mesh>(null);
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
            whiteSpace: "nowrap",
            fontSize: 12,
          }}
        >
          {label}: {percentage.toFixed(1)}%
        </div>
      </Html>
    </group>
  );
}

function PyramidGroup({ data }: { data: EnteractiveItem[] }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  useFrame((state) => {
  const { clock } = state;

    const { clock } = state;
  
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  const angleStep = (2 * Math.PI) / data.length;

  return (
    <group ref={groupRef}>
      {data.map((item, i) => {
        const angle = i * angleStep;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = (item.project_scope / 100) * 5 || 0.1;
        const color = `hsl(${(item.project_scope / 100) * 120}, 80%, 50%)`;
        return (
          <Bar
            key={item.id}
            position={[x, height / 2, z]}
            scale={[1, height, 1]}
            color={color}
            label={item.name}
            percentage={item.project_scope}
            videoUrl={item.link}
          />
        );
      })}
    </group>
  );
}

export default function Space() {
  const [enteractives, setEnteractives] = useState<EnteractiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("enteractive")
        .select(
          "id, name, description, img_url, link, is_active, progress, project_scope, created_at"
        );

      if (error) {
        console.error(error);
      } else if (data) {
        setEnteractives(data as EnteractiveItem[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "white" }}>Enteractive Dashboard</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <div style={{ marginBottom: 32 }}>
            {enteractives.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #444",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: "#222",
                }}
              >
                <h2 style={{ color: "white" }}>{item.name}</h2>
                <p style={{ color: "#ccc" }}>{item.description}</p>
                {item.img_url && (
                  <img
                    src={item.img_url}
                    alt={item.name}
                    style={{ width: "100%", borderRadius: 4, marginBottom: 8 }}
                  />
                )}
                <div style={{ margin: "8px 0" }}>
                  <div
                    style={{
                      background: "#555",
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
                  <small style={{ color: "white" }}>{item.progress}% Complete</small>
                </div>
                {item.link && (
                  <video
                    src={item.link}
                    controls
                    style={{ width: "100%", borderRadius: 4, marginTop: 8 }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ height: 500 }}>
            <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
              <Suspense fallback={null}>
                <PyramidGroup data={enteractives} />
              </Suspense>
              <OrbitControls
                enableZoom
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 4}
              />
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}
