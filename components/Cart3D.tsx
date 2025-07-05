'use client';

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Example: you have cart.glb and product files in /public/models
function CartModel({ products }: { products: any[] }) {
  const { scene: cartScene } = useGLTF("/models/cart.glb");
  const cartRef = useRef<THREE.Group>(null);

  // Animate cart rocking
  useFrame((_, delta) => {
    if (cartRef.current) {
      cartRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.07;
    }
  });

  return (
    <group>
      <primitive ref={cartRef} object={cartScene} scale={1.3} position={[0, -0.8, 0]} />
      {products.map((prod, i) => {
        const { scene } = useGLTF(prod.url);
        return (
          <primitive
            key={prod.id}
            object={scene}
            position={[
              Math.sin(i) * 0.6 + 0.01 * i,
              0.75 + 0.19 * (i % 2),
              Math.cos(i) * 0.45 - 0.05 * i,
            ]}
            scale={0.39}
          />
        );
      })}
    </group>
  );
}

const Cart3D = ({ products, onCheckout }: { products: any[], onCheckout?: () => void }) => {
  return (
    <div style={{
      width: "100%",
      height: 400,
      background: "#181c2e",
      borderRadius: 18,
      boxShadow: "0 4px 26px #0af2",
      position: "relative",
      margin: "auto"
    }}>
      <Canvas camera={{ position: [0, 2.2, 7], fov: 36 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 6, 5]} intensity={0.7} />
        <Suspense fallback={null}>
          <CartModel products={products} />
        </Suspense>
        <OrbitControls enableZoom maxDistance={12} minDistance={5} />
      </Canvas>
      {/* Checkout bar/button */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        background: "rgba(30,40,60,0.95)",
        padding: 16,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        color: "#fff",
        textAlign: "center",
        fontWeight: 700
      }}>
        <button
          style={{
            background: "#10e084",
            color: "#222",
            fontWeight: 800,
            fontSize: 20,
            border: "none",
            borderRadius: 12,
            padding: "12px 32px",
            cursor: "pointer",
            boxShadow: "0 2px 10px #0af3"
          }}
          onClick={onCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart3D;
