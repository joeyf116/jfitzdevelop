import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { Cylinder } from './parts'

// Goose, a European village dog: lean and long, with a long narrow muzzle and a tucked waist.
// Glossy black everywhere except: legs fading into dark brindle toward the paws, white toes,
// a white bib, a white streak up the nose and a white chin, tan dots over the eyes,
// tan-brindle cheeks, semi-folded ears, and an orange collar.
const coat = '#121216'
const brindle = '#4a2f1d'
const tan = '#a8743f'
const white = '#f2efe9'
const tongue = '#e77a8f'
const collar = '#d9822b'
const bed = '#3a4254'

type Vec3 = [number, number, number]

function Part({ position, scale, color, rotation = [0, 0, 0], detail = 1 }: { position: Vec3; scale: Vec3; color: string; rotation?: Vec3; detail?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={color} flatShading roughness={0.45} />
    </mesh>
  )
}

const LEG_TOP = 0.58
// Body, neck, and head sit lower than their modeled height so they meet the shorter legs.
const BODY_DROP = -0.14
// He stands side-on to show off his length, with his head turned toward the viewer.
const HEAD_TURN = 0.6
const STRIPES = [0.09, 0.15, 0.2, 0.26, 0.32]

/** A long, thin leg: black at the top, fading into dark brindle stripes, with white toes. */
function Leg({ x, z, tilt = 0 }: { x: number; z: number; tilt?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[tilt, 0, 0]}>
      <Cylinder radiusTop={0.05} radiusBottom={0.036} height={LEG_TOP} color={coat} position={[0, LEG_TOP / 2 + 0.03, 0]} segments={7} roughness={0.45} />
      {/* brindle: stripes get denser toward the paw so the black fades into it */}
      {STRIPES.map((y, i) => (
        <Cylinder key={y} radiusTop={0.039} height={i < 2 ? 0.03 : 0.02} color={brindle} position={[0, y, 0]} segments={7} roughness={0.7} />
      ))}
      <Part position={[0, 0.035, 0.03]} scale={[0.05, 0.035, 0.08]} color={coat} detail={0} />
      <Part position={[0, 0.03, 0.08]} scale={[0.045, 0.028, 0.04]} color={white} detail={0} />
    </group>
  )
}

/** Goose standing on his bed. His tail wags (harder on hover) and he breathes while motion is on. */
export function Goose({ animate, excited }: { animate: boolean; excited: boolean }) {
  const tail = useRef<Group>(null)
  const chest = useRef<Group>(null)
  const head = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    if (tail.current) tail.current.rotation.y = Math.sin(t * (excited ? 16 : 5)) * (excited ? 0.6 : 0.3)
    if (chest.current) chest.current.scale.setScalar(1 + Math.sin(t * 6) * 0.012)
    if (head.current) head.current.rotation.set(0, HEAD_TURN + Math.sin(t * 0.6) * 0.15, Math.sin(t * 0.9) * 0.05 + (excited ? 0.2 : 0))
  })

  return (
    <group>
      {/* dog bed */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 0.9, 0.12, 20]} />
        <meshStandardMaterial color={bed} roughness={1} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.8, 0.1, 8, 24]} />
        <meshStandardMaterial color="#4a5368" roughness={1} />
      </mesh>

      {/* body runs along +z (head forward) */}
      <group position={[0, 0.12, -0.05]}>
        <group ref={chest} position={[0, BODY_DROP, 0]}>
          {/* deep chest, long thin waist tucked up, narrow hindquarters */}
          <Part position={[0, 0.9, 0.3]} scale={[0.14, 0.19, 0.32]} color={coat} />
          <Part position={[0, 0.95, -0.08]} scale={[0.1, 0.11, 0.34]} color={coat} />
          <Part position={[0, 0.94, -0.46]} scale={[0.12, 0.14, 0.22]} color={coat} />
          {/* white bib on the chest */}
          <Part position={[0, 0.82, 0.5]} scale={[0.08, 0.13, 0.06]} rotation={[0.35, 0, 0]} color={white} />
        </group>

        <Leg x={-0.08} z={0.4} />
        <Leg x={0.08} z={0.4} />
        <Leg x={-0.08} z={-0.52} tilt={-0.12} />
        <Leg x={0.08} z={-0.52} tilt={-0.12} />

        <group position={[0, BODY_DROP, 0]}>
        {/* long thin tail hanging and curving */}
        <group ref={tail} position={[0, 0.98, -0.66]}>
          <Cylinder radiusTop={0.03} radiusBottom={0.016} height={0.5} color={coat} position={[0, -0.18, -0.12]} rotation={[0.55, 0, 0]} segments={6} />
        </group>

        {/* neck and orange collar */}
        <Part position={[0, 1.1, 0.5]} scale={[0.085, 0.17, 0.09]} rotation={[0.6, 0, 0]} color={coat} />
        <mesh position={[0, 1.1, 0.52]} rotation={[Math.PI / 2 - 0.6, 0, 0]}>
          <torusGeometry args={[0.095, 0.024, 6, 16]} />
          <meshStandardMaterial color={collar} roughness={0.5} />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, 1.28, 0.62]} rotation={[0, HEAD_TURN, 0]}>
          <Part position={[0, 0, 0]} scale={[0.11, 0.11, 0.13]} color={coat} />
          {/* long, narrow muzzle */}
          <Part position={[0, -0.04, 0.2]} scale={[0.055, 0.055, 0.15]} color={coat} />
          {/* white streak up the nose, white chin, black nose */}
          <Part position={[0, 0.03, 0.17]} scale={[0.018, 0.012, 0.13]} rotation={[-0.15, 0, 0]} color={white} detail={0} />
          <Part position={[0, -0.09, 0.22]} scale={[0.04, 0.02, 0.07]} color={white} detail={0} />
          <Part position={[0, -0.02, 0.35]} scale={[0.028, 0.025, 0.025]} color="#050506" detail={0} />
          {/* happy open mouth and tongue */}
          <Part position={[0, -0.075, 0.27]} scale={[0.045, 0.012, 0.06]} color="#2a0f14" detail={0} />
          <Part position={[0, -0.1, 0.28]} scale={[0.03, 0.012, 0.05]} rotation={[0.5, 0, 0]} color={tongue} detail={0} />
          {/* tan-brindle cheeks and tan dots over the eyes */}
          <Part position={[-0.065, -0.05, 0.1]} scale={[0.035, 0.03, 0.05]} color={tan} detail={0} />
          <Part position={[0.065, -0.05, 0.1]} scale={[0.035, 0.03, 0.05]} color={tan} detail={0} />
          <Part position={[-0.045, 0.07, 0.1]} scale={[0.016, 0.012, 0.012]} color={tan} detail={0} />
          <Part position={[0.045, 0.07, 0.1]} scale={[0.016, 0.012, 0.012]} color={tan} detail={0} />
          <Part position={[-0.045, 0.035, 0.115]} scale={[0.015, 0.015, 0.01]} color="#2a1a10" detail={0} />
          <Part position={[0.045, 0.035, 0.115]} scale={[0.015, 0.015, 0.01]} color="#2a1a10" detail={0} />
          {/* semi-folded ears: upright base, tips flopping forward */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.075, 0.1, -0.02]} rotation={[0, 0, -side * 0.3]}>
              <Part position={[0, 0.05, 0]} scale={[0.04, 0.06, 0.018]} color={coat} detail={0} />
              <Part position={[0, 0.1, 0.03]} scale={[0.035, 0.035, 0.014]} rotation={[1.1, 0, 0]} color={coat} detail={0} />
            </group>
          ))}
        </group>
        </group>
      </group>
    </group>
  )
}
