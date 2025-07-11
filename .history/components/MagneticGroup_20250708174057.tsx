const modelBase = "/models/";

const getModelUrl = (name: string) => modelBase + encodeURIComponent(name + ".glb");

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
