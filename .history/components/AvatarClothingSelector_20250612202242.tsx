import React, { useRef, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

function Avatar({ clothing }) {
  const { nodes, materials } = useGLTF('/avatar-model.glb')
  const avatarRef = useRef()

  useFrame(() => {
    avatarRef.current.rotation.y += 0.005
  })

  return (
    <group ref={avatarRef} position={[0, -1, 0]}>
      <mesh geometry={nodes.Body.geometry} material={materials.Skin} />
      <mesh geometry={nodes.Head.geometry} material={materials.Skin} />
      {/* Clothing parts */}
      {clothing.includes('shirt') && <mesh geometry={nodes.Shirt.geometry} material={materials.Cloth} />}
      {clothing.includes('pants') && <mesh geometry={nodes.Pants.geometry} material={materials.Cloth} />}
      {clothing.includes('shoes') && <mesh geometry={nodes.Shoes.geometry} material={materials.Shoes} />}
    </group>
  )
}

export default function AvatarClothingSelector() {
  const [selectedClothing, setSelectedClothing] = useState(['shirt', 'pants', 'shoes'])

  const toggleClothing = item => {
    setSelectedClothing(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: '#000' }}>
      <Canvas camera={{ position: [0, 1, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Avatar clothing={selectedClothing} />
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>

      <div style={{ marginTop: 20, display: 'flex', gap: '10px' }}>
        {['shirt', 'pants', 'shoes'].map(item => (
          <button
            key={item}
            onClick={() => toggleClothing(item)}
            style={{
              padding: '8px 16px',
              background: selectedClothing.includes(item) ? '#0a84ff' : '#444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {selectedClothing.includes(item) ? `Remove ${item}` : `Add ${item}`}
          </button>
        ))}
      </div>
    </div>
  )
}
