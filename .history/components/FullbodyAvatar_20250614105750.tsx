import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
//import { useRef } from 'react'
import { Group } from 'three'

// ...



function FullBodyModel() {
  const group = useRef<Group>(null!)
  //const group = useRef()
  const { scene } = useGLTF('/models/avatar-model.glb')

  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = Math.PI // face forward
    }
  }, [])

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.002 // slow rotation
    }
  })

  return <primitive ref={group} object={scene} scale={1.2} />
}

export default function FullBodyAvatar() {
  return (
    <div style={{ width: '100%', height: 400, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <Canvas camera={{ position: [0, 1.8, 3] }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          <FullBodyModel />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
