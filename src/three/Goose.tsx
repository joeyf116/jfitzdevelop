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
const bedRim = '#4a5368'
const cushion = '#56607a'

type Vec3 = [number, number, number]

function Part({ position, scale, color, rotation = [0, 0, 0], detail = 1 }: { position: Vec3; scale: Vec3; color: string; rotation?: Vec3; detail?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={color} flatShading roughness={0.45} />
    </mesh>
  )
}

/**
 * A leg modeled lying flat and pointing forward (+z) from `position`: black near the body,
 * fading into denser brindle stripes toward the white-toed paw.
 */
function Leg({ position, length, rotation = [0, 0, 0] }: { position: Vec3; length: number; rotation?: Vec3 }) {
  const stripes = [0.55, 0.65, 0.73, 0.8, 0.87].map((t) => t * length)
  return (
    <group position={position} rotation={rotation}>
      <Cylinder radiusTop={0.048} radiusBottom={0.034} height={length} color={coat} position={[0, 0, length / 2]} rotation={[Math.PI / 2, 0, 0]} segments={7} roughness={0.45} />
      {stripes.map((z, i) => (
        <Cylinder key={z} radiusTop={0.038} height={i < 2 ? 0.028 : 0.02} color={brindle} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} segments={7} roughness={0.7} />
      ))}
      <Part position={[0, -0.01, length + 0.02]} scale={[0.048, 0.03, 0.06]} color={coat} detail={0} />
      <Part position={[0, -0.012, length + 0.065]} scale={[0.044, 0.026, 0.035]} color={white} detail={0} />
    </group>
  )
}

/** Goose lying in his bed, head up. He breathes, his tail thumps, and he perks up on hover. */
export function Goose({ animate, excited }: { animate: boolean; excited: boolean }) {
  const tail = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    if (tail.current) tail.current.rotation.y = Math.sin(t * (excited ? 14 : 2)) * (excited ? 0.45 : 0.12)
    if (body.current) body.current.scale.set(1 + Math.sin(t * 2.2) * 0.02, 1 + Math.sin(t * 2.2) * 0.03, 1)
    if (head.current) {
      head.current.rotation.set(excited ? -0.15 : 0.05 + Math.sin(t * 0.5) * 0.04, 0.45 + Math.sin(t * 0.35) * 0.2, (excited ? 0.25 : 0) + Math.sin(t * 0.8) * 0.04)
    }
  })

  return (
    <group>
      {/* bed: base, cushion, and a raised rim */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1, 0.12, 24]} />
        <meshStandardMaterial color={bed} roughness={1} />
      </mesh>
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.04, 24]} />
        <meshStandardMaterial color={cushion} roughness={1} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.88, 0.12, 8, 28]} />
        <meshStandardMaterial color={bedRim} roughness={1} />
      </mesh>

      {/* Goose, lying along +z with his head up. Everything sits on the cushion (y ≈ 0.15). */}
      <group position={[0, 0.15, -0.05]}>
        <group ref={body}>
          {/* deep chest, long waist, hips rolled onto one side */}
          <Part position={[0, 0.17, 0.22]} scale={[0.15, 0.16, 0.3]} color={coat} />
          <Part position={[0, 0.15, -0.12]} scale={[0.12, 0.12, 0.32]} color={coat} />
          <Part position={[0.04, 0.15, -0.44]} scale={[0.16, 0.13, 0.2]} rotation={[0, 0, 0.35]} color={coat} />
          {/* white bib */}
          <Part position={[0, 0.12, 0.47]} scale={[0.08, 0.1, 0.05]} rotation={[0.4, 0, 0]} color={white} />
          {/* folded hind leg: thigh on the side, lower leg tucked forward */}
          <Part position={[0.15, 0.13, -0.38]} scale={[0.07, 0.11, 0.17]} color={coat} />
        </group>

        {/* front legs stretched out on the cushion */}
        <Leg position={[-0.085, 0.04, 0.38]} length={0.42} />
        <Leg position={[0.085, 0.04, 0.38]} length={0.4} rotation={[0, 0.12, 0]} />
        {/* hind legs: one tucked forward along the side, one peeking out behind */}
        <Leg position={[0.2, 0.04, -0.5]} length={0.36} rotation={[0, 0.15, 0]} />
        <Leg position={[-0.12, 0.04, -0.52]} length={0.26} rotation={[0, -2.6, 0]} />

        {/* tail curled around the side of the bed */}
        <group ref={tail} position={[0, 0.1, -0.6]}>
          <Cylinder radiusTop={0.03} radiusBottom={0.018} height={0.42} color={coat} position={[-0.17, -0.04, 0.06]} rotation={[Math.PI / 2, 0, -1.1]} segments={6} />
        </group>

        {/* neck and orange collar */}
        <Part position={[0, 0.33, 0.43]} scale={[0.085, 0.16, 0.09]} rotation={[0.45, 0, 0]} color={coat} />
        <mesh position={[0, 0.36, 0.46]} rotation={[Math.PI / 2 - 0.45, 0, 0]}>
          <torusGeometry args={[0.093, 0.024, 6, 16]} />
          <meshStandardMaterial color={collar} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.27, 0.54]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#e2c37a" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* head, turned toward the room */}
        <group ref={head} position={[0, 0.5, 0.55]} rotation={[0.05, 0.45, 0]}>
          <Part position={[0, 0, 0]} scale={[0.11, 0.105, 0.13]} color={coat} />
          {/* long, narrow muzzle */}
          <Part position={[0, -0.035, 0.19]} scale={[0.052, 0.052, 0.15]} color={coat} />
          {/* white streak up the nose, white chin, black nose */}
          <Part position={[0, 0.032, 0.14]} scale={[0.016, 0.011, 0.14]} rotation={[-0.18, 0, 0]} color={white} detail={0} />
          <Part position={[0, -0.085, 0.2]} scale={[0.038, 0.02, 0.07]} color={white} detail={0} />
          <Part position={[0, -0.018, 0.34]} scale={[0.027, 0.024, 0.024]} color="#050506" detail={0} />
          {/* relaxed open mouth and tongue */}
          <Part position={[0, -0.07, 0.26]} scale={[0.042, 0.011, 0.055]} color="#2a0f14" detail={0} />
          <Part position={[0.01, -0.095, 0.27]} scale={[0.028, 0.011, 0.05]} rotation={[0.55, 0, 0.1]} color={tongue} detail={0} />
          {/* tan-brindle cheeks and tan dots over the eyes */}
          <Part position={[-0.065, -0.05, 0.1]} scale={[0.034, 0.03, 0.05]} color={tan} detail={0} />
          <Part position={[0.065, -0.05, 0.1]} scale={[0.034, 0.03, 0.05]} color={tan} detail={0} />
          <Part position={[-0.045, 0.068, 0.1]} scale={[0.016, 0.012, 0.012]} color={tan} detail={0} />
          <Part position={[0.045, 0.068, 0.1]} scale={[0.016, 0.012, 0.012]} color={tan} detail={0} />
          {/* eyes with a tiny highlight */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.045, 0.034, 0.112]}>
              <Part position={[0, 0, 0]} scale={[0.016, 0.016, 0.01]} color="#2a1a10" detail={0} />
              <mesh position={[side * 0.004, 0.005, 0.009]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
          {/* semi-folded ears: upright base, tips flopping forward */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.075, 0.095, -0.02]} rotation={[0, 0, -side * 0.35]}>
              <Part position={[0, 0.05, 0]} scale={[0.04, 0.06, 0.018]} color={coat} detail={0} />
              <Part position={[0, 0.1, 0.03]} scale={[0.035, 0.035, 0.014]} rotation={[1.1, 0, 0]} color={coat} detail={0} />
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}
