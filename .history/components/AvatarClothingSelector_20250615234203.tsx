import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import Image from 'next/image'

const CLOTHING_OPTIONS = ['Default', 'Casual', 'Business', 'Armor']
const AVATAR_MODELS = {
  Default: '/avatars/avatar-default.glb',
  Casual: '/avatars/avatar-casual.glb',
  Business: '/avatars/avatar-business.glb',
  Armor: '/avatars/avatar-armor.glb'
}
const AVATAR_THUMBS = {
  Default: '/avatars/thumb-default.jpg',
  Casual: '/avatars/thumb-casual.jpg',
  Business: '/avatars/thumb-business.jpg',
  Armor: '/avatars/thumb-armor.jpg'
}

function Avatar({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath)
  const avatarRef = useRef<THREE.Object3D>(null)

  useFrame(() => {
    if (avatarRef.current) {
      avatarRef.current.rotation.y += 0.002
    }
  })

  return <primitive ref={avatarRef} object={scene} scale={1.2} position={[0, -1.5, 0]} />
}

export default function AvatarClothingSelector() {
  const [selectedClothing, setSelectedClothing] = useState<string>('Default')

  return (
    <div style={{ width: '100%', maxWidth: 800, height: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <OrbitControls enableZoom={false} />
        <Avatar modelPath={AVATAR_MODELS[selectedClothing]} />
      </Canvas>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 12 }}>
        {CLOTHING_OPTIONS.map(option => (
          <button
            key={option}
            onClick={() => setSelectedClothing(option)}
            style={{
              border: selectedClothing === option ? '2px solid #0af' : '1px solid #555',
              borderRadius: 8,
              padding: 4,
              background: '#111',
              cursor: 'pointer'
            }}
          >
            <Image src={AVATAR_THUMBS[option]} alt={option} width={60} height={60} style={{ borderRadius: 6 }} />
            <div style={{ color: '#fff', marginTop: 4 }}>{option}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

useGLTF.preload('/avatars/avatar-default.glb')
useGLTF.preload('/avatars/avatar-casual.glb')
useGLTF.preload('/avatars/avatar-business.glb')
useGLTF.preload('/avatars/avatar-armor.glb')
