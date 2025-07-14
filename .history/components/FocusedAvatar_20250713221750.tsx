import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function FocusedModel() {
  const { scene } = useGLTF("/models/lanvin.glb");
  return <primitive object={scene} />;
}

// Preload outside the component
useGLTF.preload("/models/lanvin.glb");

export default function FocusedAvatar() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        height: 400,
        background: "#151a21",
        borderRadius: 12,
        boxShadow: "0 4px 20px #0af3",
      }}
    >
      <Canvas camera={{ position: [0, 1.5, 2.5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 5, 2]} intensity={1} />
        <Suspense fallback={null}>
          <FocusedModel />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
}
