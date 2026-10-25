import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { palette } from '../theme/palette'
import { BlackBelt } from './BlackBelt'
import { Goose } from './Goose'
import { Guitar } from './Guitar'
import { Interactive } from './Interactive'
import { Lamp } from './Lamp'
import { Monitor } from './Monitor'
import { Speaker } from './Speaker'
import { Box, Cylinder } from './parts'

const ROOM = 6
const WALL_H = 4.2
const DESK_Y = 1.5
// Where Goose looks when the amp stack is hovered.
const SPEAKER_GAZE: [number, number, number] = [-2.7, 0.9, 2.05]

function Shell() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM, ROOM]} />
        <meshStandardMaterial color={palette.floor} roughness={0.95} />
      </mesh>
      {/* back and left walls */}
      <Box size={[ROOM, WALL_H, 0.15]} color={palette.wall} position={[0, WALL_H / 2, -ROOM / 2 - 0.075]} />
      <Box size={[0.15, WALL_H, ROOM]} color={palette.wall} position={[-ROOM / 2 - 0.075, WALL_H / 2, 0]} />
      {/* baseboards */}
      <Box size={[ROOM, 0.14, 0.04]} color={palette.trim} position={[0, 0.07, -ROOM / 2 + 0.02]} />
      <Box size={[0.04, 0.14, ROOM]} color={palette.trim} position={[-ROOM / 2 + 0.02, 0.07, 0]} />
      {/* one big warm rug ties the desk and Goose's corner together */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.55, 0.004, -0.75]} receiveShadow>
        <planeGeometry args={[3.9, 2.7]} />
        <meshStandardMaterial color={palette.rugBorder} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.55, 0.006, -0.75]} receiveShadow>
        <planeGeometry args={[3.6, 2.4]} />
        <meshStandardMaterial color={palette.rug} roughness={1} />
      </mesh>
    </group>
  )
}

// Soft curtains framing the window, on a slim rod.
function Curtains() {
  return (
    <group position={[-ROOM / 2 + 0.09, 0, -0.4]}>
      <Box size={[0.03, 0.03, 2.5]} color={palette.metal} position={[0, 3.5, 0]} metalness={0.5} />
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 2.45, side * 1.08]}>
          {[-0.08, 0, 0.08].map((dz, i) => (
            <Box key={dz} size={[0.05, 2.1, 0.1]} color={i === 1 ? palette.curtain : palette.curtainFold} position={[i === 1 ? 0.02 : 0, 0, dz]} roughness={1} />
          ))}
        </group>
      ))}
    </group>
  )
}

const BULB_SPACING = 0.32

/** Warm fairy lights draped along the tops of the back and left walls. */
function StringLights({ animate }: { animate: boolean }) {
  const materials = useMemo(
    () => [0, 1, 2].map(() => new MeshStandardMaterial({ color: palette.lampLight, emissive: palette.lampLight, emissiveIntensity: 1.6, toneMapped: false })),
    [],
  )
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  // A slow, gentle twinkle: three groups of bulbs breathe out of phase.
  useFrame(({ clock }) => {
    if (!animate) return
    materials.forEach((material, i) => {
      material.emissiveIntensity = 1.3 + Math.sin(clock.elapsedTime * 1.3 + i * 2.1) * 0.5
    })
  })

  const bulbs = useMemo(() => {
    const out: [number, number, number][] = []
    const span = ROOM - 0.3
    const count = Math.floor(span / BULB_SPACING)
    for (let i = 0; i <= count; i++) {
      const t = i / count
      const sag = Math.sin(t * Math.PI * 3) ** 2 * 0.14 // three gentle swoops per wall
      out.push([-span / 2 + t * span, 3.95 - sag, -ROOM / 2 + 0.06])
      out.push([-ROOM / 2 + 0.06, 3.95 - sag, -span / 2 + t * span])
    }
    return out
  }, [])

  return (
    <group>
      {bulbs.map((position, i) => (
        <mesh key={i} position={position} material={materials[i % 3]}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>
      ))}
      <pointLight position={[0, 3.6, -2.4]} color={palette.lampLight} intensity={1.2} distance={4} decay={2} />
      <pointLight position={[-2.4, 3.6, 0]} color={palette.lampLight} intensity={1.2} distance={4} decay={2} />
    </group>
  )
}

function Window() {
  return (
    <group position={[-ROOM / 2 + 0.01, 2.5, -0.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.8, 1.5]} />
        <meshStandardMaterial color={palette.windowGlow} emissive={palette.windowGlow} emissiveIntensity={0.4} />
      </mesh>
      <Box size={[1.9, 0.06, 0.05]} color={palette.trim} position={[0, 0.78, 0]} />
      <Box size={[1.9, 0.06, 0.05]} color={palette.trim} position={[0, -0.78, 0]} />
      <Box size={[0.06, 1.6, 0.05]} color={palette.trim} position={[-0.93, 0, 0]} />
      <Box size={[0.06, 1.6, 0.05]} color={palette.trim} position={[0.93, 0, 0]} />
      <Box size={[0.04, 1.5, 0.04]} color={palette.trim} />
      <Box size={[1.8, 0.04, 0.04]} color={palette.trim} />
    </group>
  )
}

// About: a framed picture on the back wall (mountains at night, a nod to getting things done anywhere).
function WallFrame() {
  return (
    <group position={[1.6, 2.95, -ROOM / 2 + 0.03]}>
      <Box size={[1.3, 1, 0.05]} color={palette.trim} />
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.12, 0.82]} />
        <meshStandardMaterial color={palette.screen} />
      </mesh>
      <mesh position={[-0.18, -0.1, 0.035]} rotation={[0, 0, Math.PI / 2]}>
        <circleGeometry args={[0.32, 3]} />
        <meshStandardMaterial color={palette.accent} />
      </mesh>
      <mesh position={[0.2, -0.17, 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <circleGeometry args={[0.24, 3]} />
        <meshStandardMaterial color={palette.code[1]} />
      </mesh>
      <mesh position={[0.32, 0.22, 0.04]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color={palette.lampLight} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Desk() {
  const legs: [number, number][] = [
    [-1.45, -2.85],
    [1.45, -2.85],
    [-1.45, -1.75],
    [1.45, -1.75],
  ]
  return (
    <group>
      <Box size={[3.1, 0.1, 1.3]} color={palette.desk} position={[0, DESK_Y, -2.3]} roughness={0.6} />
      {legs.map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.08, DESK_Y - 0.05, 0.08]} color={palette.deskLeg} position={[x, (DESK_Y - 0.05) / 2, z]} />
      ))}
      {/* mug */}
      <Cylinder radiusTop={0.1} height={0.22} color={palette.mug} position={[1.2, DESK_Y + 0.16, -2.2]} />
    </group>
  )
}

function Workstation({ animate }: { animate: boolean }) {
  return (
    <group>
      <Monitor animate={animate} />
      {/* keyboard and mouse */}
      <Box size={[0.95, 0.04, 0.3]} color={palette.trim} position={[0.1, DESK_Y + 0.07, -1.95]} />
      <Box size={[0.12, 0.04, 0.18]} color={palette.trim} position={[0.85, DESK_Y + 0.07, -1.95]} />
    </group>
  )
}

// Experience: a corkboard on the left wall with each role pinned up as a note.
const NOTES: { y: number; z: number; color: string; tilt: number }[] = [
  { y: 0.2, z: -0.3, color: palette.code[0], tilt: 0.08 },
  { y: 0.18, z: 0.12, color: palette.code[1], tilt: -0.1 },
  { y: -0.16, z: -0.22, color: palette.code[3], tilt: -0.05 },
  { y: -0.14, z: 0.24, color: palette.mug, tilt: 0.12 },
]

function Corkboard() {
  return (
    <group position={[-ROOM / 2 + 0.03, 2.65, -2.2]} rotation={[0, Math.PI / 2, 0]}>
      <Box size={[1.25, 0.95, 0.05]} color={palette.trim} />
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.12, 0.82]} />
        <meshStandardMaterial color={palette.cork} roughness={1} />
      </mesh>
      {NOTES.map((note, i) => (
        <group key={i} position={[note.z, note.y, 0.035 + i * 0.002]} rotation={[0, 0, note.tilt]}>
          <mesh>
            <planeGeometry args={[0.3, 0.26]} />
            <meshStandardMaterial color={note.color} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.1, 0.02]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshStandardMaterial color="#d84f4f" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Contact: a phone and a notebook under the lamp.
function Phone() {
  return (
    <group position={[-0.8, DESK_Y + 0.05, -1.95]} rotation={[0, 0.35, 0]}>
      <Box size={[0.28, 0.025, 0.5]} color={palette.monitor} position={[0, 0.0125, 0]} roughness={0.3} />
      <mesh position={[0, 0.027, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.24, 0.44]} />
        <meshBasicMaterial color={palette.screen} />
      </mesh>
      <Box size={[0.45, 0.03, 0.6]} color={palette.books[2]} position={[-0.42, 0.015, -0.05]} rotation={[0, -0.25, 0]} />
    </group>
  )
}

function Chair() {
  return (
    <group position={[0.1, 0, -0.95]} rotation={[0, 0.25, 0]}>
      <Box size={[0.95, 0.12, 0.9]} color={palette.chair} position={[0, 0.95, 0]} roughness={0.9} />
      <Box size={[0.9, 1, 0.12]} color={palette.chair} position={[0, 1.55, 0.42]} rotation={[-0.08, 0, 0]} roughness={0.9} />
      <Cylinder radiusTop={0.05} height={0.8} color={palette.metal} position={[0, 0.5, 0]} metalness={0.6} />
      <Box size={[0.9, 0.05, 0.08]} color={palette.metal} position={[0, 0.1, 0]} metalness={0.6} />
      <Box size={[0.08, 0.05, 0.9]} color={palette.metal} position={[0, 0.1, 0]} metalness={0.6} />
    </group>
  )
}

// Skills: one book per skill group.
const BOOK_WIDTHS = [0.15, 0.12, 0.16, 0.13, 0.11, 0.14]
const BOOKS = BOOK_WIDTHS.map((width, i) => {
  const left = -2 + BOOK_WIDTHS.slice(0, i).reduce((sum, w) => sum + w + 0.02, 0)
  const height = 0.38 + (i % 3) * 0.06
  return { width, height, x: left + width / 2 }
})

function Shelf() {
  return (
    <group position={[0, 3.2, -ROOM / 2 + 0.2]}>
      <Box size={[1.9, 0.06, 0.4]} color={palette.desk} position={[-1.15, 0, 0]} />
      {BOOKS.map((book, i) => (
        <Box
          key={i}
          size={[book.width, book.height, 0.3]}
          color={palette.books[i % palette.books.length]}
          position={[book.x, book.height / 2 + 0.03, 0]}
        />
      ))}
      {/* small plant on the shelf */}
      <Cylinder radiusTop={0.1} radiusBottom={0.08} height={0.16} color={palette.pot} position={[-0.45, 0.11, 0]} />
      <mesh position={[-0.45, 0.28, 0]} castShadow>
        <icosahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color={palette.plant} flatShading />
      </mesh>
    </group>
  )
}

function Plant() {
  return (
    <group position={[2.3, 0, -2.3]}>
      <Cylinder radiusTop={0.3} radiusBottom={0.24} height={0.6} color={palette.pot} position={[0, 0.3, 0]} />
      {[
        [0, 0.95, 0, 0.38],
        [0.18, 1.3, 0.05, 0.3],
        [-0.15, 1.2, -0.1, 0.28],
        [0.02, 1.6, -0.02, 0.22],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={palette.plant} flatShading roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Room({ animate }: { animate: boolean }) {
  return (
    <group>
      <Shell />
      <Window />
      <Desk />
      <Chair />
      <Plant />
      <Lamp />
      <Curtains />
      <StringLights animate={animate} />
      {/* Click the amp stack (left of the guitar) to play or stop the lofi. */}
      <group position={[-ROOM / 2 + 0.26, 0, 2.05]} rotation={[0, Math.PI / 2, 0]}>
        <Speaker animate={animate} gaze={SPEAKER_GAZE} />
      </group>
      <Interactive chapter="about" animate={animate} glow={[1.6, 2.95, -2.4]}>
        <WallFrame />
      </Interactive>
      <Interactive chapter="skills" animate={animate} glow={[-1.4, 3.5, -2.3]}>
        <Shelf />
      </Interactive>
      <Interactive chapter="experience" animate={animate} glow={[-2.4, 2.65, -2.2]}>
        <Corkboard />
      </Interactive>
      <Interactive chapter="projects" animate={animate} glow={[0.1, 2.4, -1.9]}>
        <Workstation animate={animate} />
      </Interactive>
      <Interactive chapter="contact" animate={animate} glow={[-0.8, 1.95, -1.75]}>
        <Phone />
      </Interactive>
      {/* Hobbies: the guitar and Goose both open the same chapter. */}
      {/* Hobbies, grouped along the left wall around the window: Goose's bed under it,
          the black belt and the guitar beside it. */}
      <Interactive chapter="hobbies" animate={animate} glow={[-1.7, 1.1, 0]} gazeAtMe={false}>
        {(hovered) => (
          <group position={[-2, 0, -0.4]} rotation={[0, -0.5, 0]}>
            <Goose animate={animate} excited={hovered} />
          </group>
        )}
      </Interactive>
      <Interactive chapter="hobbies" animate={animate} glow={[-2.4, 3, 1.05]}>
        <group position={[-ROOM / 2, 3.6, 1.05]} rotation={[0, Math.PI / 2, 0]}>
          <BlackBelt />
        </group>
      </Interactive>
      <Interactive chapter="hobbies" animate={animate} glow={[-2, 1.4, 1.1]}>
        <group position={[-2.45, 0, 1.1]} rotation={[0, Math.PI / 2 - 0.35, 0]}>
          <Guitar />
        </group>
      </Interactive>
    </group>
  )
}
