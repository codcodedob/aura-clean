// components/PyramidSliceWithVideo.tsx
import { useRef, useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

export default function PyramidSliceWithVideo({
  label,
  projectScope,
  videoUrl
}: {
  label: string;
  projectScope: number;
  videoUrl: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture>();
  const [hovered, setHovered] = useState(false);

  // Load video as texture
  useEffect(() => {
    if (!videoUrl) return;

    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    setVideoTexture(texture);
  }, [videoUrl]);

  // Animate scale on hover
  useEffect(() => {
    if (!meshRef.current) return;
    gsap.to(meshRef.current.scale, { y: hovered ? 1.2 : 1, duration: 0.3 });
  }, [hovered]);

  const height = projectScope / 25;
  const color = projectScope > 70 ? "green" : projectScope > 40 ? "orange" : "red";

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxBufferGeometry args={[0.5, height, 0.5]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={color} />
        )}
      </mesh>

      {/* Floating label */}
      <Html center position={[0, height + 0.3, 0]}>
        <div style={{
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px"
        }}>
          {label}<br />{projectScope}%
        </div>
      </Html>
    </group>
  );
}
