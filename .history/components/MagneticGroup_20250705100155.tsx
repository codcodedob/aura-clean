// components/MagneticGroup.tsx
import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type MagneticGroupProps = {
  mainModel: string;
  itemModels: { name: string; url: string }[]; // expects array of { name, url }
  mouse: THREE.Vector2;
};

const modelBase = "/models/"; // or your bucket path

function MagneticObject({ url, position }: { url: string; position: [number, number, number] }) {
  // Use GLTF loader for each model
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} position={position} />;
}

const MagneticGroup: React.FC<MagneticGroupProps> = ({ mainModel, itemModels, mouse }) => {
  // Main model in center
  const { scene: mainScene } = useGLTF(modelBase + mainModel, true);

  // Distribute items around in a circle and add basic "magnetism"
  const radius = 3.5;
  const magnetStrength = 1.5;
  const positions = useMemo(() => {
    const len = itemModels.length;
    return itemModels.map((item, i) => {
      // Distribute in a circle, but offset by mouse as a "magnet"
      const angle = (i / len) * Math.PI * 2;
      const dx = Math.cos(angle) * radius + mouse.x * magnetStrength;
      const dz = Math.sin(angle) * radius + mouse.y * magnetStrength;
      return [dx, 0, dz] as [number, number, number];
    });
  }, [itemModels, mouse.x, mouse.y]);

  return (
    <group>
      {/* Main object in the middle */}
      <primitive object={mainScene} position={[0, 0, 0]} />
      {/* Orbiting items */}
      {itemModels.map((item, i) => (
        <MagneticObject key={item.name || i} url={modelBase + item.name} position={positions[i]} />
      ))}
    </group>
  );
};

export default MagneticGroup;
