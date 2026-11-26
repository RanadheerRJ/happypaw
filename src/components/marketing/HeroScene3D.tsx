import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

/**
 * Decorative 3D hero scene: a floating bowl with a paw-print topper and a
 * few ingredient spheres drifting around it. Purely decorative (the parent
 * marks it aria-hidden). Kept light: capped DPR, reduced-motion aware.
 */

function Bowl() {
  const mesh = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={mesh}>
      {/* Bowl body — a lathe geometry gives it a real 3D profile */}
      <mesh castShadow receiveShadow position={[0, -0.35, 0]}>
        <latheGeometry
          args={[
            [
              [0.02, 0.1],
              [0.32, 0.1],
              [0.5, 0.28],
              [0.62, 0.5],
              [0.66, 0.62],
              [0.6, 0.68],
              [0.42, 0.7],
              [0.2, 0.66],
              [0.05, 0.58],
            ].map(([r, y]) => new THREE.Vector2(r, y)),
            48,
          ]}
        />
        <meshStandardMaterial color="#F3ECDB" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Food mound inside the bowl */}
      <mesh position={[0, 0.12, 0]} scale={[0.62, 0.28, 0.62]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#C9532A" roughness={0.8} />
      </mesh>

      {/* Leaf on top */}
      <mesh position={[0.16, 0.3, 0.1]} rotation={[0.4, 0.6, -0.2]} scale={[0.28, 0.12, 0.18]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#5E8B5D" roughness={0.7} />
      </mesh>
    </group>
  );
}

function PawTopper() {
  const group = useRef<THREE.Group>(null);
  const reduce = useReducedMotion();
  const pointer = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state) => {
    if (!group.current) return;
    pointer.set(state.pointer.x * 0.5, state.pointer.y * 0.4);
    group.current.rotation.x += (pointer.y - group.current.rotation.x) * 0.04;
    group.current.rotation.y += (pointer.x - group.current.rotation.y) * 0.04;
    if (!reduce) group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
  });

  return (
    <group ref={group} position={[0, 1.15, 0]}>
      {/* Paw pad */}
      <mesh>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#E06A3B" roughness={0.5} metalness={0.08} />
      </mesh>
      {/* Toes */}
      {[
        [-0.34, 0.24, 0.06],
        [-0.12, 0.34, 0.02],
        [0.12, 0.34, -0.02],
        [0.34, 0.24, -0.06],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} scale={[0.16, 0.2, 0.16]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color="#C9532A" roughness={0.5} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingIngredients() {
  const reduce = useReducedMotion();
  const items = useMemo(
    () => [
      { pos: [-1.4, 0.7, -0.6] as [number, number, number], scale: 0.34, color: '#5E8B5D', speed: 0.7 },
      { pos: [1.5, -0.4, -0.8] as [number, number, number], scale: 0.28, color: '#E06A3B', speed: 0.5 },
      { pos: [1.25, 1.0, 0.2] as [number, number, number], scale: 0.22, color: '#9DBFA0', speed: 0.9 },
      { pos: [-1.3, -0.7, 0.3] as [number, number, number], scale: 0.26, color: '#C9532A', speed: 0.6 },
    ],
    [],
  );

  return (
    <group>
      {items.map(({ pos, scale, color, speed }, i) => (
        <Float
          key={i}
          speed={reduce ? 0 : speed}
          rotationIntensity={reduce ? 0 : 2.4}
          floatIntensity={reduce ? 0 : 1.6}
          position={pos}
        >
          <mesh scale={scale}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} flatShading />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <group>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#9DBFA0" />

      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
        <Bowl />
      </Float>
      <PawTopper />
      <FloatingIngredients />
    </group>
  );
}

export function HeroScene3D() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4.6], fov: 42 }}
        frameloop={reduce ? 'demand' : 'always'}
        shadows
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        {/* Soft floor shadow under the bowl */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <circleGeometry args={[1.3, 48]} />
          <meshBasicMaterial color="#14402F" transparent opacity={0.08} />
        </mesh>
      </Canvas>
    </div>
  );
}
