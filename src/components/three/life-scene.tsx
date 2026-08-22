"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Line, Sparkles } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Group, Mesh, PointLight } from "three"

import {
  LIFE_PHASES,
  PHASE_DURATION_SECONDS,
  SCENE_COLORS,
  orbitPoints,
  phaseAtElapsed,
  phaseProgress,
} from "./life-scene-config"

type VectorTuple = [number, number, number]

function BodyPart({
  kind,
  position,
  rotation = [0, 0, 0],
  scale,
}: {
  kind: "sphere" | "capsule"
  position: VectorTuple
  rotation?: VectorTuple
  scale: VectorTuple
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      {kind === "sphere" ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <capsuleGeometry args={[0.5, 1, 8, 24]} />
      )}
      <meshStandardMaterial
        color={SCENE_COLORS.mist}
        roughness={0.72}
        metalness={0.08}
      />
    </mesh>
  )
}

function HumanFigure() {
  return (
    <group>
      <BodyPart
        kind="sphere"
        position={[0, 1.85, 0]}
        scale={[0.43, 0.52, 0.45]}
      />
      <BodyPart
        kind="capsule"
        position={[0, 1.38, 0]}
        scale={[0.34, 0.34, 0.34]}
      />
      <BodyPart
        kind="capsule"
        position={[0, 0.63, 0]}
        scale={[1.05, 1.18, 0.72]}
      />
      <BodyPart
        kind="sphere"
        position={[0, -0.28, 0]}
        scale={[0.68, 0.48, 0.54]}
      />
      <BodyPart
        kind="capsule"
        position={[-0.88, 0.48, 0]}
        rotation={[0, 0, 0.08]}
        scale={[0.36, 1.28, 0.36]}
      />
      <BodyPart
        kind="capsule"
        position={[0.88, 0.48, 0]}
        rotation={[0, 0, -0.08]}
        scale={[0.36, 1.28, 0.36]}
      />
      <BodyPart
        kind="capsule"
        position={[-0.35, -1.42, 0]}
        rotation={[0, 0, 0.025]}
        scale={[0.43, 1.48, 0.43]}
      />
      <BodyPart
        kind="capsule"
        position={[0.35, -1.42, 0]}
        rotation={[0, 0, -0.025]}
        scale={[0.43, 1.48, 0.43]}
      />
    </group>
  )
}

function Orbit({
  radius,
  rotation,
  speed,
  offset,
}: {
  radius: number
  rotation: VectorTuple
  speed: number
  offset: number
}) {
  const node = useRef<Mesh>(null)
  const points = useMemo(() => orbitPoints(radius), [radius])

  useFrame(({ clock }) => {
    if (!node.current) return

    const angle = clock.elapsedTime * speed + offset
    node.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.42,
      Math.sin(angle) * 0.28
    )
  })

  return (
    <group rotation={rotation}>
      <Line
        points={points}
        color={SCENE_COLORS.flow}
        transparent
        opacity={0.25}
        lineWidth={0.65}
      />
      <mesh ref={node}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={SCENE_COLORS.flow} />
      </mesh>
    </group>
  )
}

function IdentitySystem() {
  const root = useRef<Group>(null)
  const orbital = useRef<Group>(null)
  const insight = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    const breath = 1 + Math.sin(time * 0.62) * 0.008

    root.current?.scale.setScalar(breath)

    if (orbital.current) orbital.current.rotation.y = time * 0.025

    if (insight.current) {
      const pulse = Math.sin(phaseProgress(time) * Math.PI) ** 8
      insight.current.intensity =
        phaseAtElapsed(time) === "integrate" ? pulse * 2.2 : 0
    }
  })

  return (
    <group>
      <group ref={root}>
        <HumanFigure />
      </group>
      <group ref={orbital}>
        <Orbit
          radius={2.05}
          rotation={[0.18, 0.12, 0]}
          speed={0.15}
          offset={0}
        />
        <Orbit
          radius={2.28}
          rotation={[1.02, 0.28, 0.62]}
          speed={0.11}
          offset={2.1}
        />
        <Orbit
          radius={2.42}
          rotation={[-0.82, -0.16, -0.54]}
          speed={0.09}
          offset={4.2}
        />
      </group>
      <pointLight
        ref={insight}
        position={[1.8, 0.4, 1.4]}
        color={SCENE_COLORS.insight}
        distance={4.5}
        intensity={0}
      />
    </group>
  )
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={[SCENE_COLORS.space]} />
      <ambientLight intensity={0.48} />
      <directionalLight
        position={[-3, 4, 4]}
        color={SCENE_COLORS.mist}
        intensity={2.1}
      />
      <pointLight
        position={[3, 0.8, 2]}
        color={SCENE_COLORS.flow}
        intensity={2.4}
        distance={7}
      />
      <IdentitySystem />
      <Sparkles
        count={42}
        scale={[6, 5.5, 3]}
        size={1.1}
        speed={0.08}
        opacity={0.22}
        color={SCENE_COLORS.flow}
        noise={[1, 0.35, 1]}
      />
    </>
  )
}

export function LifeScene() {
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(
      () => setPhaseIndex((index) => (index + 1) % LIFE_PHASES.length),
      PHASE_DURATION_SECONDS * 1000
    )

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full min-h-64 w-full bg-[var(--life-space)]">
      <Canvas
        aria-hidden="true"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.15, 7.3], fov: 36 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <SceneContent />
      </Canvas>
      <div className="absolute right-8 bottom-8 font-mono text-[10px] tracking-[0.18em] text-[var(--life-flow)] uppercase">
        {LIFE_PHASES[phaseIndex]}
      </div>
      <p className="sr-only">
        Um corpo humano abstrato respira enquanto compreender, alinhar,
        refinar e integrar formam um ciclo contínuo.
      </p>
    </div>
  )
}
