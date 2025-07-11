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

// Helper to get full model URL, adding .glb only if missing, and encoding spaces
const getModelUrl = (name: string) => {
  if (name.toLowerCase().endsWith(".glb")) {
    return modelBase + encodeURIComponent(name);
  }
  return modelBase + encodeURIComponent(name + ".glb");
};

function MagneticObject({ url, position }: { url: string; position: [number, number, number] }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} position={position} />;
}

const MagneticGroup: React.FC<MagneticGroupProps> = ({ mainModel, itemModels, mouse }) => {
  const { scene: mainScene } = useGLTF(getModelUrl(mainModel), true);

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
      <primitive object={mainScene} position={[0, 0, 0]} />
      {itemModels.map((item, i) => (
        <MagneticObject key={item.name || i} url={getModelUrl(item.name)} position={positions[i]} />
      ))}
    </group>
  );
};

export default MagneticGroup;
