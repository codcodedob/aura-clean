import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}
export default function FocusedAvatar() {
  return <div style={{ width: 300, height: 300, background: '#333' }}>Focused Mode GLB Model</div>
 function FocusedAvatar() {
    return (
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <Model url="/models/body-part-1.glb" />
        <Model url="/models/body-part-2.glb" />
        <Model url="/models/body-part-3.glb" />
        <Model url="/models/body-part-4.glb" />
        <Model url="/models/body-part-5.glb" />
      </Canvas>
    )
  }
}

