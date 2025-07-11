// /components/MagneticGroup.tsx

import React from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface MagneticGroupProps {
  mainModel: string;
  itemModels: string[];
  mouse: THREE.Vector2;
}

const MagneticGroup: React.FC<MagneticGroupProps> = ({ mainModel, itemModels, mouse }) => {
  const [mainObject, setMainObject] = React.useState<any>(null);
  const [items, setItems] = React.useState<any[]>([]);

  // Load main object and items
  React.useEffect(() => {
    // Main model
    const loader = new GLTFLoader();
    loader.load(mainModel, (gltf) => {
      setMainObject(gltf.scene);
    });

    // Item models
    const loadedItems = itemModels.map((modelUrl) => {
      const item = loader.load(modelUrl, (gltf) => {
        return gltf.scene;
      });
      return item;
    });

    setItems(loadedItems);
  }, [mainModel, itemModels]);

  // Magnetic force logic
  React.useEffect(() => {
    if (mainObject) {
      // Apply magnetic logic based on mouse position
      const magneticStrength = 2;
      mainObject.position.x = mouse.x * magneticStrength;
      mainObject.position.y = mouse.y * magneticStrength;
    }
  }, [mouse, mainObject]);

  return (
    <group>
      {/* Main Object */}
      {mainObject && <primitive object={mainObject} />}
      {/* Items */}
      {items.map((item, index) => (
        <primitive key={index} object={item} />
      ))}
    </group>
  );
};

export default MagneticGroup;
