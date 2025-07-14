import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

interface ModelProps {
  modelPaths: string[];
}

function Model({ path, position }: { path: string; position: [number, number, number] }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} position={position} scale={1} />;
}

export default function FullBodyAvatar({ modelPaths }: ModelProps) {
  // Generate positions in a grid pattern dynamically if needed
  const gridSpacing = 4;
  const gridPositions: [number, number, number][] = modelPaths.map((_, i) => [
    (i % 3) * gridSpacing - gridSpacing, // x: -4, 0, 4
    0,
    Math.floor(i / 3) * gridSpacing - gridSpacing, // z: -4, 0, 4, etc.
  ]);

  // Preload all models
  modelPaths.forEach((path) => useGLTF.preload(path));

  return (
    <div style={{ width: "100%", height: 500, background: "#111" }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 5, 2]} intensity={1} />
        <Suspense fallback={null}>
          {modelPaths.map((path, index) => (
            <Model
              key={index}
              path={path}
              position={gridPositions[index]}
            />
          ))}
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
