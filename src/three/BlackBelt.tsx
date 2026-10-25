import { palette } from '../theme/palette'
import { Box, Cylinder } from './parts'

const belt = '#141417'
const rankBar = '#c23b32'

/** A jiu-jitsu black belt, knotted and hanging from a peg on the wall. */
export function BlackBelt() {
  return (
    <group>
      {/* light wood display board so the black belt stands out against the dark wall */}
      <Box size={[0.5, 1.35, 0.04]} color="#a8865f" position={[0, -0.5, 0.02]} roughness={0.7} />
      {/* wall peg */}
      <Cylinder radiusTop={0.035} height={0.14} color={palette.metal} position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]} segments={10} metalness={0.5} />
      {/* folded loop over the peg and the knot */}
      <Box size={[0.26, 0.09, 0.05]} color={belt} position={[0, 0.02, 0.1]} roughness={0.9} />
      <Box size={[0.14, 0.12, 0.07]} color={belt} position={[0, -0.08, 0.11]} rotation={[0, 0, 0.6]} roughness={0.9} />
      {/* two tails hanging down, the front one with the red rank bar */}
      <group position={[-0.06, -0.12, 0.09]} rotation={[0, 0, 0.12]}>
        <Box size={[0.085, 0.95, 0.02]} color={belt} position={[0, -0.475, 0]} roughness={0.9} />
      </group>
      <group position={[0.06, -0.12, 0.11]} rotation={[0, 0, -0.08]}>
        <Box size={[0.085, 0.85, 0.02]} color={belt} position={[0, -0.425, 0]} roughness={0.9} />
        <Box size={[0.087, 0.2, 0.022]} color={rankBar} position={[0, -0.68, 0]} roughness={0.8} />
      </group>
    </group>
  )
}
