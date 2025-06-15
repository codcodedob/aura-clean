import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function FullBodyAvatar({
  position = [0, 0, 0],
}: {
  position?: [number, number, number]
}) {
  const { scene } = useGLTF('/models/full-body.glb')

  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 2]} intensity={1} />
      <primitive
        object={scene}
        position={new THREE.Vector3(...position)}
        scale={1}
      />
      <OrbitControls />
    </Canvas>
  )
}
