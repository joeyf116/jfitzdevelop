import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group } from 'three'
import { getGaze } from './hotspots'
import { Cylinder } from './parts'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// The upper muzzle and the white streak share this center so the streak sits flush on it.
const MUZZLE: [number, number, number] = [0, -0.02, 0.19]

// Things Goose glances at when nothing is hovered (world space): the window, the desk,
// the lamp, the amp, the front of the room, and the plant.
const GLANCES: [number, number, number][] = [
  [-3, 2.4, -0.6],
  [0.1, 2.3, -2.5],
  [-0.6, 2.4, -2.3],
  [-2.7, 0.9, 2.05],
  [1.5, 1, 2.5],
  [2.3, 1, -2.2],
]

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
  const jaw = useRef<Group>(null)
  const tongueRef = useRef<Group>(null)

  const lookAt = useMemo(() => new Vector3(), [])
  const idle = useRef({ spot: -1, until: 0 })
  const mouth = useRef({ open: 0, panting: false, until: 0 })

  useFrame(({ camera, clock, pointer }, delta) => {
    const t = clock.elapsedTime

    // Where Goose looks, in order: whatever is hovered, then (while idle) either you,
    // following the camera as you scroll, or a quick glance at something in the room.
    const h = head.current
    if (h?.parent) {
      const hovered = getGaze()
      if (hovered) {
        lookAt.set(...hovered)
      } else {
        if (animate && t > idle.current.until) {
          const glance = Math.random() < 0.45
          idle.current.spot = glance ? Math.floor(Math.random() * GLANCES.length) : -1
          idle.current.until = t + (glance ? 1.2 + Math.random() * 1.8 : 2.5 + Math.random() * 3)
        }
        const spot = animate ? idle.current.spot : -1
        if (spot >= 0) lookAt.set(...GLANCES[spot])
        else lookAt.copy(camera.position)
      }
      h.parent.worldToLocal(lookAt)
      const dx = lookAt.x - h.position.x
      const dy = lookAt.y - h.position.y
      const dz = lookAt.z - h.position.z
      const yaw = clamp(Math.atan2(dx, dz) + pointer.x * 0.35, -1.1, 1.1)
      const pitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)) - pointer.y * 0.15, -0.55, 0.3)
      const tilt = (excited ? 0.25 : 0) + (animate ? Math.sin(t * 0.8) * 0.05 : 0)
      const ease = animate ? Math.min(1, delta * 3) : 1
      h.rotation.y += (yaw - h.rotation.y) * ease
      h.rotation.x += (pitch - h.rotation.x) * ease
      h.rotation.z += (tilt - h.rotation.z) * ease
    }

    // Mouth: every few seconds he either relaxes with it closed or opens up for a happy pant.
    // Hovering him always gets the excited pant.
    const m = mouth.current
    if (animate && t > m.until) {
      m.panting = Math.random() < 0.6
      m.until = t + (m.panting ? 2 + Math.random() * 3 : 1.5 + Math.random() * 2.5)
    }
    const panting = excited || (animate && m.panting)
    m.open += ((panting ? 1 : 0) - m.open) * (animate ? Math.min(1, delta * 5) : 1)
    const pant = animate ? Math.sin(t * (excited ? 16 : 12)) : 0
    if (jaw.current) jaw.current.rotation.x = m.open * (0.32 + pant * 0.07)
    if (tongueRef.current) {
      tongueRef.current.rotation.x = m.open * 0.35
      tongueRef.current.scale.set(1, 1, 0.7 + m.open * (0.45 + pant * 0.06))
    }

    if (!animate) return
    if (tail.current) tail.current.rotation.y = Math.sin(t * (excited ? 14 : panting ? 5 : 2)) * (excited ? 0.45 : 0.12)
    if (body.current) {
      // panting means quick, shallow breaths; otherwise slow and deep
      const breath = panting ? Math.sin(t * 12) * 0.012 : Math.sin(t * 2.2) * 0.025
      body.current.scale.set(1 + breath * 0.7, 1 + breath, 1)
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

        {/* neck, with the orange collar sitting low near the shoulders (well clear of his mouth) */}
        <Part position={[0, 0.33, 0.43]} scale={[0.085, 0.16, 0.09]} rotation={[0.45, 0, 0]} color={coat} />
        <mesh position={[0, 0.25, 0.4]} rotation={[Math.PI / 2 - 0.55, 0, 0]}>
          <torusGeometry args={[0.09, 0.02, 6, 18]} />
          <meshStandardMaterial color={collar} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.19, 0.48]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#e2c37a" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* head, turned toward the room */}
        {/* YXZ order: turn (yaw) first, then look up or down, like a real neck. */}
        <group ref={head} position={[0, 0.5, 0.55]} rotation={[0.05, 0.45, 0, 'YXZ']}>
          <Part position={[0, 0, 0]} scale={[0.11, 0.105, 0.13]} color={coat} />
          {/* long, narrow upper muzzle and black nose */}
          <Part position={MUZZLE} scale={[0.05, 0.04, 0.15]} color={coat} detail={2} />
          {/* white streak: a thin ellipsoid sharing the muzzle's center and shape, a hair taller,
              so it shows as a flush stripe along the top of the snout instead of a separate piece */}
          <Part position={MUZZLE} scale={[0.016, 0.0412, 0.151]} color={white} detail={2} />
          <Part position={[0, -0.012, 0.335]} scale={[0.026, 0.023, 0.022]} color="#050506" detail={0} />

          {/* lower jaw on a hinge, with the white chin, the inside of the mouth, and the tongue */}
          <group ref={jaw} position={[0, -0.045, 0.08]}>
            <Part position={[0, -0.01, 0.12]} scale={[0.042, 0.02, 0.12]} color={coat} detail={2} />
            <Part position={[0, -0.01, 0.12]} scale={[0.03, 0.0212, 0.105]} color={white} detail={2} />
            <Part position={[0, 0.006, 0.12]} scale={[0.035, 0.008, 0.1]} color="#4a1520" detail={1} />
            <group ref={tongueRef} position={[0, 0.01, 0.08]}>
              <Part position={[0, 0, 0.1]} scale={[0.026, 0.008, 0.1]} rotation={[0.12, 0, 0]} color={tongue} detail={1} />
            </group>
          </group>
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
