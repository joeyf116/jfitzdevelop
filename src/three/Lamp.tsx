import { useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { palette } from '../theme/palette'
import { Box, Cylinder } from './parts'

// Desk lamp the visitor can click or tap to switch on and off.
export function Lamp() {
  const [on, setOn] = useState(true)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const toggle = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    setOn((value) => !value)
  }

  return (
    <group
      position={[-1.15, 1.55, -2.35]}
      onClick={toggle}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Invisible, larger hit area so the lamp is easy to tap on a phone. */}
      <mesh position={[0.3, 0.6, 0]}>
        <sphereGeometry args={[0.65, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Cylinder radiusTop={0.18} height={0.04} color={palette.metal} position={[0, 0.02, 0]} metalness={0.5} roughness={0.4} />
      <Box size={[0.04, 0.75, 0.04]} color={palette.metal} position={[0.08, 0.38, 0]} rotation={[0, 0, -0.2]} metalness={0.5} />
      <Box size={[0.04, 0.55, 0.04]} color={palette.metal} position={[0.32, 0.86, 0]} rotation={[0, 0, -1.15]} metalness={0.5} />
      <group position={[0.55, 0.88, 0]} rotation={[0, 0, -0.35]}>
        <mesh castShadow>
          <coneGeometry args={[0.2, 0.28, 24, 1, true]} />
          <meshStandardMaterial color={palette.metal} side={2} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={palette.lampLight}
            emissive={palette.lampLight}
            emissiveIntensity={on ? 3 : 0}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0, -0.25, 0]}
          color={palette.lampLight}
          intensity={on ? 6 : 0}
          distance={4}
          decay={2}
          castShadow
          shadow-mapSize={[512, 512]}
        />
      </group>
    </group>
  )
}
