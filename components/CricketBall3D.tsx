"use client";

/**
 * components/CricketBall3D.tsx
 * -------------------------------
 * The page's signature element: a slowly rotating, stitched leather
 * cricket ball lit like it's sitting under stadium floodlights. Built
 * with react-three-fiber (Three.js) rather than a stock GLB model, so the
 * seam stitching is drawn as actual geometry.
 */

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Seam({ rotation }: { rotation: [number, number, number] }) {
  // A thin torus traces one seam line around the ball's leather sphere.
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[1.001, 0.012, 8, 128]} />
      <meshStandardMaterial color="#F2EFE9" roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

function Stitches({ rotation }: { rotation: [number, number, number] }) {
  // Small dashes along the seam to suggest hand-stitching, without a texture.
  const count = 40;
  const dashes = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    dashes.push(
      <mesh key={i} position={[Math.cos(angle) * 1.01, Math.sin(angle) * 1.01, 0]} rotation={[0, 0, angle]}>
        <boxGeometry args={[0.02, 0.05, 0.015]} />
        <meshStandardMaterial color="#E3DACB" />
      </mesh>
    );
  }
  return <group rotation={rotation}>{dashes}</group>;
}

function Ball() {
  const ballRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ballRef.current) {
      ballRef.current.rotation.y += delta * 0.28;
      ballRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={ballRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#C62828" roughness={0.35} metalness={0.1} />
      </mesh>
      <Seam rotation={[0, 0, 0]} />
      <Seam rotation={[0, Math.PI / 2, 0]} />
      <Stitches rotation={[0, 0, 0]} />
      <Stitches rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

export default function CricketBall3D() {
  return (
    <div className="h-[280px] w-[280px] sm:h-[360px] sm:w-[360px] mx-auto" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} dpr={[1, 1.8]}>
        <Suspense fallback={null}>
          {/* Enhanced Floodlight-style lighting for better pop against dark bg */}
          <ambientLight intensity={0.25} color="#ffffff" />
          <pointLight position={[4, 5, 4]} intensity={140} color="#F5E6C8" />
          <pointLight position={[-4, 3, -3]} intensity={60} color="#F5E6C8" />
          <spotLight
            position={[0, 6, 3]}
            angle={0.6}
            penumbra={0.8}
            intensity={100}
            color="#FFFDF6"
          />
          <Ball />
        </Suspense>
      </Canvas>
    </div>
  );
}
