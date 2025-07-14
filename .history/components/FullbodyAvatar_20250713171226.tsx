import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface ModelProps {
  modelPaths: string[]
}

function Model({ path, position }: { path: string; position: [number, number, number] }) {
  const { scene } = useGLTF(path)
  return <primitive object={scene} position={new THREE.Vector3(...position)} scale={1} />
}

export default function FullBodyAvatar({ modelPaths }: ModelProps) {
  const gridPositions: [number, number, number][] = [
    [-2, 0, -2],
    [2, 0, -2],
    [-2, 0, 2],
    [2, 0, 2],
    [0, 0, 0],
  ]

  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 2]} intensity={1} />
      {modelPaths.map((path, index) => (
        <Model key={index} path={path} position={gridPositions[index % gridPositions.length]} />
      ))}
      <OrbitControls />
    </Canvas>
  )
}
