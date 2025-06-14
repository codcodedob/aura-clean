import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

function Avatar() {
  const { scene } = useGLTF('/avatar-model.glb')
  const avatarRef = useRef()

  useFrame(() => {
    if (avatarRef.current) {
      avatarRef.current.rotation.y += 0.003
    }
  })

  return <primitive ref={avatarRef} object={scene} scale={1.2} position={[0, -1.5, 0]} />
}

export default function AvatarClothingSelector() {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <OrbitControls enableZoom={false} />
        <Avatar />
      </Canvas>
    </div>
  )
}
