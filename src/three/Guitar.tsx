import { palette } from '../theme/palette'
import { Box, Cylinder } from './parts'

const top = '#e0a35e'
const back = '#8a4f2a'
const neck = '#5a3620'

/** Acoustic guitar resting on an A-frame stand. */
export function Guitar() {
  return (
    <group>
      {/* stand */}
      <Box size={[0.05, 0.05, 0.7]} color={palette.metal} position={[0, 0.03, 0.05]} rotation={[0, 0, 0]} metalness={0.5} />
      <Box size={[0.05, 0.9, 0.05]} color={palette.metal} position={[0, 0.45, -0.2]} rotation={[-0.25, 0, 0]} metalness={0.5} />
      <Box size={[0.5, 0.05, 0.08]} color={palette.metal} position={[0, 0.2, 0.15]} metalness={0.5} />

      {/* the guitar leans back onto the stand */}
      <group position={[0, 0.24, 0.12]} rotation={[-0.22, 0, 0]}>
        {/* lower and upper bouts */}
        <Cylinder radiusTop={0.36} height={0.2} color={back} position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} segments={20} roughness={0.5} />
        <Cylinder radiusTop={0.28} height={0.2} color={back} position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]} segments={20} roughness={0.5} />
        <mesh position={[0, 0.38, 0.101]}>
          <circleGeometry args={[0.35, 20]} />
          <meshStandardMaterial color={top} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.82, 0.101]}>
          <circleGeometry args={[0.27, 20]} />
          <meshStandardMaterial color={top} roughness={0.45} />
        </mesh>
        {/* sound hole and bridge */}
        <mesh position={[0, 0.66, 0.103]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#2a1a10" />
        </mesh>
        <Box size={[0.22, 0.04, 0.03]} color={neck} position={[0, 0.3, 0.11]} />
        {/* neck, frets side, and headstock */}
        <Box size={[0.1, 1, 0.07]} color={neck} position={[0, 1.5, 0.05]} />
        <Box size={[0.16, 0.24, 0.05]} color={neck} position={[0, 2.1, 0.04]} rotation={[0.2, 0, 0]} />
        {[-0.05, 0.05].map((x) =>
          [2.02, 2.1, 2.18].map((y) => (
            <Cylinder key={`${x}${y}`} radiusTop={0.015} height={0.06} color="#c3cad8" position={[x * 2, y, 0.06]} rotation={[0, 0, Math.PI / 2]} segments={6} metalness={0.7} />
          )),
        )}
        {/* strings */}
        {[-0.03, -0.01, 0.01, 0.03].map((x) => (
          <Box key={x} size={[0.004, 1.72, 0.004]} color="#e7e9ee" position={[x, 1.16, 0.105]} metalness={0.8} roughness={0.2} />
        ))}
      </group>
    </group>
  )
}
