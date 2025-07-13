import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import gsap from "gsap";

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

function BarMesh({
  item,
  index,
}: {
  item: EnteractiveItem;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(
    null
  );
  const [scaleY, setScaleY] = useState(0.01);

  // Animate height on mount
  useEffect(() => {
    gsap.to(meshRef.current!.scale, {
      y: (item.project_scope / 100),
      duration: 1,
      ease: "power2.out"
    });
  }, [item.project_scope]);

  // Load video texture if link exists
  useEffect(() => {
    if (item.link) {
      const video = document.createElement("video");
      video.src = item.link;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.play();
      const texture = new THREE.VideoTexture(video);
      setVideoTexture(texture);
    }
  }, [item.link]);

  const barWidth = 0.8;
  const maxHeight = 4;

  return (
    <group position={[index * (barWidth + 0.5), 0, 0]}>
      <mesh
        ref={meshRef}
        scale={[1, scaleY, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (item.link) window.open(item.link, "_blank");
        }}
      >
        <boxGeometry args={[barWidth, maxHeight, barWidth]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial
            color={
              hovered
                ? "orange"
                : `hsl(${(item.project_scope / 100) * 120},100%,50%)`
            }
          />
        )}
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html distanceFactor={10}>
          <div
            style={{
              padding: "4px 8px",
              background: "#000",
              color: "#fff",
              borderRadius: 4,
              fontSize: 12,
              whiteSpace: "nowrap"
            }}
          >
            {item.name}: {item.project_scope.toFixed(1)}%
          </div>
        </Html>
      )}
    </group>
  );
}

function PyramidGroup({ data }: { data: EnteractiveItem[] }) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate group slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {data.map((item, i) => (
        <BarMesh key={item.id} item={item} index={i} />
      ))}
    </group>
  );
}

export default function EnteractivePyramid({
  data,
  width = 400,
  height = 400,
}: EnteractivePyramidProps) {
  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <PyramidGroup data={data} />
        </Suspense>
      </Canvas>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        {data.map((item) => (
          <div key={item.id} style={{ fontWeight: 500 }}>
            {item.name}: {item.project_scope.toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}
