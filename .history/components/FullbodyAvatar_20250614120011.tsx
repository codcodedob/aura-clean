import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

const modelPaths = [
  '/models/crown.glb',
  '/models/top.glb',
  '/models/bottom.glb',
  '/models/base-inner.glb',
  '/models/base-outer.glb'
]

function Model({ path, position = [0, 0, 0] }: { path: string, position?: [number, number, number] }) {
  const { scene } = useGLTF(path)
  const group = useRef<THREE.Group>(null!)

  useEffect(() => {
    if (scene) {
      scene.traverse(obj => {
        if ((obj as any).isMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })
    }
  }, [scene])

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={group} position={position} scale={[1.2, 1.2, 1.2]}>
      <primitive object={scene} />
    </group>
  )
}

export default function FullBodyAvatar() {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <Canvas shadows camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        {modelPaths.map((path, i) => (
          <Suspense fallback={null} key={i}>
            <Model path={path} position={[0, i * -0.4, 0]} />
          </Suspense>
        ))}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/crown.glb')
useGLTF.preload('/models/top.glb')
useGLTF.preload('/models/bottom.glb')
useGLTF.preload('/models/base-inner.glb')
useGLTF.preload('/models/base-outer.glb')
