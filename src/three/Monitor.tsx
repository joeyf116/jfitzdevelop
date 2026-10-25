import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { palette } from '../theme/palette'
import { Box } from './parts'

const SCREEN_W = 1.5
const SCREEN_H = 0.84
const LINE_H = 0.045
const LINE_GAP = 0.085
const LINE_COUNT = 8
const SECONDS_PER_LINE = 0.9

interface CodeLine {
  indent: number
  width: number
  color: string
}

// A deterministic pseudo-random "file" so the screen looks the same on every load.
function makeLines(): CodeLine[] {
  const widths = [0.55, 0.8, 0.62, 0.35, 0.9, 0.48, 0.7, 0.3]
  const indents = [0, 1, 2, 2, 1, 2, 1, 0]
  return widths.map((width, i) => ({
    indent: indents[i] * 0.09,
    width: width * (SCREEN_W - 0.3),
    color: palette.code[i % palette.code.length],
  }))
}

const LINES = makeLines()

export function Monitor({ animate }: { animate: boolean }) {
  const lineRefs = useRef<(Group | null)[]>([])

  // "Type" the lines one after another, then pause and start over.
  useFrame(({ clock }) => {
    if (!animate) return
    const cycle = LINE_COUNT * SECONDS_PER_LINE + 2
    const t = clock.elapsedTime % cycle
    lineRefs.current.forEach((line, i) => {
      if (!line) return
      const progress = Math.min(1, Math.max(0, (t - i * SECONDS_PER_LINE) / SECONDS_PER_LINE))
      line.scale.x = Math.max(0.0001, progress)
    })
  })

  const left = -SCREEN_W / 2 + 0.12
  const top = SCREEN_H / 2 - 0.12

  return (
    <group position={[0.1, 1.55, -2.5]}>
      {/* stand */}
      <Box size={[0.5, 0.03, 0.3]} color={palette.metal} position={[0, 0.015, 0]} metalness={0.6} roughness={0.4} />
      <Box size={[0.07, 0.55, 0.05]} color={palette.metal} position={[0, 0.3, -0.05]} metalness={0.6} roughness={0.4} />
      {/* bezel */}
      <Box size={[SCREEN_W + 0.08, SCREEN_H + 0.08, 0.05]} color={palette.monitor} position={[0, 0.85, 0]} />
      {/* screen */}
      <mesh position={[0, 0.85, 0.026]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial color={palette.screen} emissive={palette.screen} emissiveIntensity={1.2} />
      </mesh>
      {LINES.map((line, i) => (
        <group
          key={i}
          ref={(el) => {
            lineRefs.current[i] = el
          }}
          position={[left + line.indent, 0.85 + top - i * LINE_GAP, 0.028]}
        >
          {/* Offset the bar so scale.x grows it from its left edge. */}
          <mesh position={[line.width / 2, 0, 0]}>
            <planeGeometry args={[line.width, LINE_H]} />
            <meshBasicMaterial color={line.color} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0.85, 0.6]} color={palette.accent} intensity={1.5} distance={3} decay={2} />
    </group>
  )
}
