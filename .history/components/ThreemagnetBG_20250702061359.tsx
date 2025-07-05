// // components/ThreeMagnetBG.tsx
// import { useRef, useEffect } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { useGLTF, Environment } from '@react-three/drei'

// function MagnetModel() {
//   const ref = useRef<any>()
//   // Magnet state
//   const mouse = useRef({ x: 0, y: 0, lastMove: Date.now() })
//   const idlePos = [0, 0, 0]

//   useEffect(() => {
//     const handle = (e: MouseEvent) => {
//       // Map to -2..2 for x/y
//       mouse.current.x = ((e.clientX / window.innerWidth) - 0.5) * 4
//       mouse.current.y = -((e.clientY / window.innerHeight) - 0.5) * 2.5
//       mouse.current.lastMove = Date.now()
//     }
//     window.addEventListener('mousemove', handle)
//     return () => window.removeEventListener('mousemove', handle)
//   }, [])

//   useFrame(() => {
//     if (!ref.current) return
//     const now = Date.now()
//     // If recently moved, attract to mouse, else return to center
//     const t = Math.min((now - mouse.current.lastMove) / 2000, 1)
//     const targetX = t < 1 ? mouse.current.x : idlePos[0]
//     const targetY = t < 1 ? mouse.current.y : idlePos[1]
//     ref.current.position.x += (targetX - ref.current.position.x) * 0.07
//     ref.current.position.y += (targetY - ref.current.position.y) * 0.07
//     // Gentle rotation for "dirt bike wrap" vibe
//     ref.current.rotation.y += 0.004
//     ref.current.rotation.x = ref.current.position.y * 0.12
//     ref.current.rotation.z = -ref.current.position.x * 0.08
//     // Optional: little bounce
//     ref.current.position.z = Math.sin(now * 0.001) * 0.08
//   })

//   const { scene } = useGLTF('/xtime.glb')
//   return <primitive ref={ref} object={scene} scale={1.3} />
// }

// export default function ThreeMagnetBG() {
//   return (
//     <Canvas
//       style={{
//         position: 'fixed',
//         zIndex: 0,
//         top: 0,
//         left: 0,
//         width: '100vw',
//         height: '100vh',
//         pointerEvents: 'none'
//       }}
//       camera={{ position: [0, 0, 6], fov: 60 }}
//     >
//       <ambientLight intensity={0.9} />
//       <directionalLight position={[5, 5, 5]} intensity={0.6} />
//       <Environment preset="city" />
//       <MagnetModel />
//     </Canvas>
//   )
// }
