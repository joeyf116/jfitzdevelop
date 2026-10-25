import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'
import { palette } from '../theme/palette'
import { Box, Cylinder } from './parts'

// Modeled loosely on a Taylor 214ce: grand auditorium body with a rounded (Venetian)
// cutaway on the treble side, a pale spruce top, rosewood back and sides, a black
// teardrop pickguard, white binding, and a dark headstock.
const spruce = '#e8c992'
const rosewood = '#5a2a1a'
const binding = '#f2efe9'
const neckWood = '#6b3d22'
const ebony = '#1a1412'

const DEPTH = 0.18
// The neck sits flush with the top so the strings run just above the fretboard.
const NECK_Z = DEPTH / 2 - 0.03

/** Grand auditorium outline, neck pointing up, cutaway on the right (treble) side. */
function bodyShape(scale = 1) {
  const s = new Shape()
  const p = (x: number, y: number) => [x * scale, y * scale] as const
  s.moveTo(...p(0, 0))
  // lower bout, bass side up through the waist
  s.bezierCurveTo(...p(-0.3, 0), ...p(-0.42, 0.12), ...p(-0.41, 0.3))
  s.bezierCurveTo(...p(-0.4, 0.44), ...p(-0.25, 0.48), ...p(-0.25, 0.58))
  // upper bout, bass side
  s.bezierCurveTo(...p(-0.25, 0.68), ...p(-0.34, 0.74), ...p(-0.32, 0.86))
  s.bezierCurveTo(...p(-0.3, 0.98), ...p(-0.18, 1.0), ...p(-0.07, 1.0))
  s.lineTo(...p(0.07, 1.0))
  // Venetian cutaway: a smooth scoop into the treble-side upper bout
  s.bezierCurveTo(...p(0.1, 0.9), ...p(0.16, 0.8), ...p(0.29, 0.79))
  s.bezierCurveTo(...p(0.33, 0.73), ...p(0.25, 0.66), ...p(0.25, 0.58))
  // waist and lower bout, treble side
  s.bezierCurveTo(...p(0.25, 0.48), ...p(0.4, 0.44), ...p(0.41, 0.3))
  s.bezierCurveTo(...p(0.42, 0.12), ...p(0.3, 0), ...p(0, 0))
  return s
}

function pickguardShape() {
  const s = new Shape()
  s.moveTo(0.11, 0.5)
  s.bezierCurveTo(0.22, 0.5, 0.27, 0.6, 0.24, 0.7)
  s.bezierCurveTo(0.2, 0.78, 0.13, 0.75, 0.11, 0.68)
  s.bezierCurveTo(0.14, 0.62, 0.13, 0.55, 0.11, 0.5)
  return s
}

export function Guitar() {
  const geometry = useMemo(() => {
    const body = new ExtrudeGeometry(bodyShape(), { depth: DEPTH, bevelEnabled: false, curveSegments: 18 })
    // A thin, slightly larger slab just under the top edge reads as white binding.
    const edge = new ExtrudeGeometry(bodyShape(1.015), { depth: 0.014, bevelEnabled: false, curveSegments: 18 })
    edge.translate(0, -0.007, DEPTH - 0.016)
    const guard = new ExtrudeGeometry(pickguardShape(), { depth: 0.004, bevelEnabled: false, curveSegments: 10 })
    return { body, edge, guard }
  }, [])

  return (
    <group>
      {/* A-frame stand */}
      <Box size={[0.05, 0.05, 0.7]} color={palette.metal} position={[0, 0.03, 0.05]} metalness={0.5} />
      <Box size={[0.05, 0.9, 0.05]} color={palette.metal} position={[0, 0.45, -0.2]} rotation={[-0.25, 0, 0]} metalness={0.5} />
      <Box size={[0.5, 0.05, 0.08]} color={palette.metal} position={[0, 0.2, 0.15]} metalness={0.5} />

      {/* the guitar leans back onto the stand; body sits on the cradle */}
      <group position={[0, 0.2, 0.08]} rotation={[-0.22, 0, 0]}>
        <group position={[0, 0, -DEPTH / 2]}>
          {/* top + back (spruce) and sides (rosewood): ExtrudeGeometry groups are [caps, sides] */}
          <mesh geometry={geometry.body} castShadow>
            <meshStandardMaterial attach="material-0" color={spruce} roughness={0.4} />
            <meshStandardMaterial attach="material-1" color={rosewood} roughness={0.45} />
          </mesh>
          {/* white binding peeking out around the edge */}
          <mesh geometry={geometry.edge}>
            <meshStandardMaterial color={binding} roughness={0.4} />
          </mesh>
          <mesh geometry={geometry.guard} position={[0, 0, DEPTH + 0.001]}>
            <meshStandardMaterial color={ebony} roughness={0.3} />
          </mesh>
        </group>
        {/* sound hole with rosette, and bridge */}
        <mesh position={[0, 0.6, DEPTH / 2 + 0.003]}>
          <ringGeometry args={[0.085, 0.105, 24]} />
          <meshStandardMaterial color={binding} />
        </mesh>
        <mesh position={[0, 0.6, DEPTH / 2 + 0.002]}>
          <circleGeometry args={[0.085, 24]} />
          <meshStandardMaterial color="#1a0f0a" />
        </mesh>
        <Box size={[0.26, 0.05, 0.025]} color={ebony} position={[0, 0.24, DEPTH / 2 + 0.012]} />

        {/* neck, ebony fretboard with small inlays, and a dark headstock */}
        <Box size={[0.1, 0.95, 0.07]} color={neckWood} position={[0, 1.45, NECK_Z]} />
        <Box size={[0.1, 0.95, 0.012]} color={ebony} position={[0, 1.45, NECK_Z + 0.041]} />
        {[1.2, 1.38, 1.56, 1.8].map((y) => (
          <Box key={y} size={[0.016, 0.016, 0.004]} color={binding} position={[0, y, NECK_Z + 0.049]} rotation={[0, 0, Math.PI / 4]} />
        ))}
        <Box size={[0.15, 0.24, 0.045]} color={ebony} position={[0, 2.03, NECK_Z - 0.01]} rotation={[0.2, 0, 0]} />
        {[-0.065, 0.065].map((x) =>
          [1.96, 2.04, 2.12].map((y) => (
            <Cylinder key={`${x}${y}`} radiusTop={0.014} height={0.05} color="#c3cad8" position={[x * 1.5, y, NECK_Z - 0.01]} rotation={[0, 0, Math.PI / 2]} segments={6} metalness={0.7} />
          )),
        )}
        {/* strings */}
        {[-0.035, -0.021, -0.007, 0.007, 0.021, 0.035].map((x) => (
          <Box key={x} size={[0.003, 1.68, 0.003]} color="#e7e9ee" position={[x, 1.08, NECK_Z + 0.06]} metalness={0.8} roughness={0.2} />
        ))}
      </group>
    </group>
  )
}
