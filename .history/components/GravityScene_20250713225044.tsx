// /components/GravityScene.tsx
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MagneticGroup from "./MagneticGroup";
import * as THREE from "three";

type Model = {
  name: string;
  url: string; // now always defined
  [key: string]: unknown;
};

const modelBase = "/models/";

const getModelUrl = (name: string) => {
  if (name.toLowerCase().endsWith(".glb")) {
    return modelBase + encodeURIComponent(name);
  }
  return modelBase + encodeURIComponent(name + ".glb");
};

export default function GravityScene({
  filter,
}: {
  mode?: "cart" | "closet";
  filter?: (filename: string) => boolean;
}) {
  const [models, setModels] = useState<Model[]>([]);
  const [mouse, setMouse] = useState<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) =>
        setModels(
          data.models.map((m: { name: string }) => ({
            ...m,
            url: getModelUrl(m.name),
          }))
        )
      )
      .catch((err) => console.error("Error fetching models:", err));
  }, []);

  const mainModelName = "xtime.glb";
  const mainModelUrl = getModelUrl(mainModelName);

  let itemModels = models.filter((model) => model.name !== mainModelName);
  if (filter) itemModels = itemModels.filter((model) => filter(model.name));

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse(new THREE.Vector2(x, y));
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (!models.length)
    return <div style={{ height: 440 }}>Loading 3D...</div>;

  return (
    <div
      style={{
        width: "100%",
        height: "430px",
        background: "#151a21",
        borderRadius: 18,
        boxShadow: "0 8px 44px #0af3",
        margin: "0 auto",
      }}
    >
      <Canvas camera={{ position: [0, 3.2, 8], fov: 44 }}>
        <ambientLight intensity={0.67} />
        <pointLight position={[0, 5, 7]} intensity={1.1} castShadow />
        <MagneticGroup
          mainModel={mainModelUrl}
          itemModels={itemModels}
          mouse={mouse}
        />
        <OrbitControls
          enableZoom
          enablePan={false}
          minPolarAngle={0.95}
          maxPolarAngle={2.45}
        />
      </Canvas>
    </div>
  );
}
