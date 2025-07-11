// components/MagneticGroup.tsx
import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type MagneticGroupProps = {
  mainModel: string;
  itemModels: { name: string; url?: string }[]; // url optional since we build url from name
  mouse: THREE.Vector2;
};

const modelBase = "/models/";

// Helper to get full model URL with extension and encode spaces
const getModelUrl = (name: string) => modelBase + encodeURIComponent(name);

function MagneticObject({ url, position }: { url: string; position: [number, number, number] }) {
  // Use GLTF loader for each model
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} position={position} />;
}

const MagneticGroup: React.FC<MagneticGroupProps> = ({ mainModel, itemModels, mouse }) => {
  // Load main model scene
  const { scene: mainScene } = useGLTF(getModelUrl(mainModel), true);

  // Positions arranged in a circle with mouse "magnet" effect
  const radius = 3.5;
  const magnetStrength = 1.5;
  const positions = useMemo(() => {
    const len = itemModels.length;
    return itemModels.map((item, i) => {
      const angle = (i / len) * Math.PI * 2;
      const dx = Math.cos(angle) * radius + mouse.x * magnetStrength;
      const dz = Math.sin(angle) * radius + mouse.y * magnetStrength;
      return [dx, 0, dz] as [number, number, number];
    });
  }, [itemModels, mouse.x, mouse.y]);

  return (
    <group>
      {/* Main model centered */}
      <primitive object={mainScene} position={[0, 0, 0]} />
      {/* Orbiting item models */}
      {itemModels.map((item, i) => (
        <MagneticObject key={item.name || i} url={getModelUrl(item.name)} position={positions[i]} />
      ))}
    </group>
  );
};

export default MagneticGroup;
