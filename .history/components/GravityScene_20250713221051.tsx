import { getModelUrl } from "@/lib/getModelUrl";

export default function GravityScene({ filter }: { filter?: (filename: string) => boolean }) {
  const [models, setModels] = useState<Model[]>([]);
  const [mouse, setMouse] = useState<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => setModels(data.models))
      .catch((err) => console.error("Error fetching models:", err));
  }, []);

  const mainModel = getModelUrl("xtime");

  let itemModels = models.filter((model) => model.name !== "xtime");
  if (filter) itemModels = itemModels.filter((model) => filter(model.name));

  // Normalize URLs
  itemModels = itemModels.map((model) => ({
    ...model,
    url: getModelUrl(model.name)
  }));

  if (!models.length) return <div style={{ height: 440 }}>Loading 3D...</div>;

  return (
    <div style={{ width: "100%", height: "430px", background: "#151a21" }}>
      <Canvas camera={{ position: [0, 3.2, 8], fov: 44 }}>
        <ambientLight intensity={0.67} />
        <pointLight position={[0, 5, 7]} intensity={1.1} castShadow />
        <MagneticGroup mainModel={mainModel} itemModels={itemModels} mouse={mouse} />
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
    </div>
  );
}
