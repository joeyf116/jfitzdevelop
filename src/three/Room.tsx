import { palette } from '../theme/palette'
import { Lamp } from './Lamp'
import { Monitor } from './Monitor'
import { Box, Cylinder } from './parts'

const ROOM = 6
const WALL_H = 4.2
const DESK_Y = 1.5

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
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.005, -0.9]} receiveShadow>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial color={palette.trim} roughness={1} />
      </mesh>
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
      {/* keyboard and mouse */}
      <Box size={[0.95, 0.04, 0.3]} color={palette.trim} position={[0.1, DESK_Y + 0.07, -1.95]} />
      <Box size={[0.12, 0.04, 0.18]} color={palette.trim} position={[0.85, DESK_Y + 0.07, -1.95]} />
      {/* mug */}
      <Cylinder radiusTop={0.1} height={0.22} color={palette.mug} position={[1.2, DESK_Y + 0.16, -2.2]} />
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

function Shelf() {
  const books = [0.14, 0.11, 0.16, 0.12, 0.1]
  let x = -1.9
  return (
    <group position={[0, 3.2, -ROOM / 2 + 0.2]}>
      <Box size={[1.8, 0.06, 0.4]} color={palette.desk} position={[-1.2, 0, 0]} />
      {books.map((width, i) => {
        const height = 0.38 + (i % 3) * 0.06
        const book = (
          <Box
            key={i}
            size={[width, height, 0.3]}
            color={palette.books[i]}
            position={[x + width / 2, height / 2 + 0.03, 0]}
            rotation={[0, 0, i === 4 ? 0.25 : 0]}
          />
        )
        x += width + 0.02
        return book
      })}
      {/* small plant on the shelf */}
      <Cylinder radiusTop={0.1} radiusBottom={0.08} height={0.16} color={palette.pot} position={[-0.5, 0.11, 0]} />
      <mesh position={[-0.5, 0.28, 0]} castShadow>
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
      <Shelf />
      <Desk />
      <Monitor animate={animate} />
      <Lamp />
      <Chair />
      <Plant />
    </group>
  )
}
