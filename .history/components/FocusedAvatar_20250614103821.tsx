import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

function FocusedModel() {
  const { scene } = useGLTF('/models/focused-object.glb')
  return <primitive object={scene} />
}

export default function FocusedAvatar() {
  return (
    <div style={{ width: '100%', maxWidth: 400, height: 400 }}>
      <Canvas camera={{ position: [0, 1.5, 2.5] }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        <React.Suspense fallback={null}>
          <FocusedModel />
        </React.Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/focused-object.glb')
