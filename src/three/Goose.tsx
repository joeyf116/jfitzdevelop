import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BufferAttribute,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  LatheGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Group,
} from 'three'
import { getGaze } from './hotspots'

// Goose, a European village dog, drawn in a soft, cozy low-poly style: long and lean, a big
// friendly head, a long tapered snout, and big warm eyes. Markings are painted onto each mesh
// as vertex colors (not stuck-on pieces): glossy black coat, legs fading into brindle, tan
// eyebrow dots and cheeks, a white streak up the nose, white chin, bib, and toes.

const COAT = new Color('#1c1c22')
const BRINDLE = new Color('#5a3a22')
const TAN = new Color('#b9824c')
const WHITE = new Color('#f4f1ea')
const MOUTH = new Color('#7a2c3a')
const tongueColor = '#ef8fa0'
const collarColor = '#e0812a'
const bedColor = '#3a4254'
const bedRim = '#4a5368'
const cushion = '#56607a'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Paints a geometry with vertex colors from a function of each vertex's local position. */
function paint(geometry: BufferGeometry, painter: (p: Vector3, out: Color) => void) {
  const position = geometry.attributes.position
  const colors = new Float32Array(position.count * 3)
  const p = new Vector3()
  const c = new Color()
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i)
    c.copy(COAT)
    painter(p, c)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}

/** A spot of color with a soft edge, centered at `center` with radius `r`. */
const spot = (p: Vector3, center: Vector3, r: number) => 1 - smooth(r * 0.6, r, p.distanceTo(center))

/** A tapered snout shape (revolved profile) pointing along +z, flattened a little. */
function snoutGeometry(profile: [number, number][], flatten: number) {
  const geometry = new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    28,
  )
  geometry.rotateX(Math.PI / 2)
  geometry.scale(1, flatten, 1)
  return geometry
}

/** Black near the body, fading into brindle stripes toward a white-toed paw at +z. */
function legGeometry(radius: number, length: number) {
  const geometry = new CapsuleGeometry(radius, length, 6, 14)
  geometry.rotateX(Math.PI / 2)
  const half = length / 2 + radius
  return paint(geometry, (p, c) => {
    const t = (p.z + half) / (half * 2) // 0 at the body, 1 at the paw
    const stripe = Math.sin(p.z * 95 + Math.sin(p.x * 60) * 1.5) > 0.15 ? 1 : 0
    c.lerp(BRINDLE, stripe * smooth(0.35, 0.75, t) * 0.85)
    c.lerp(WHITE, smooth(0.9, 0.96, t))
  })
}

function useGooseGeometry() {
  return useMemo(() => {
    // Head: a soft sphere (unit radius, scaled on the mesh) with tan brows, tan cheeks, and the
    // top of the white streak running up from the nose.
    const head = paint(new SphereGeometry(1, 48, 36), (p, c) => {
      const streak = smooth(0.13, 0.06, Math.abs(p.x)) * smooth(0.55, 0.8, p.z) * smooth(-0.05, 0.2, p.y) * smooth(0.85, 0.6, p.y)
      c.lerp(TAN, spot(p, new Vector3(0.6, -0.5, 0.6), 0.3) + spot(p, new Vector3(-0.6, -0.5, 0.6), 0.3))
      c.lerp(TAN, spot(p, new Vector3(0.36, 0.52, 0.76), 0.17) + spot(p, new Vector3(-0.36, 0.52, 0.76), 0.17))
      c.lerp(WHITE, streak)
    })

    // Upper snout: long and tapered, white stripe along the top blending into the black.
    const snout = paint(
      snoutGeometry(
        [
          [0, 0],
          [0.07, 0],
          [0.069, 0.05],
          [0.063, 0.11],
          [0.052, 0.17],
          [0.04, 0.21],
          [0.024, 0.232],
          [0, 0.24],
        ],
        0.78,
      ),
      (p, c) => {
        const angle = Math.abs(Math.atan2(p.x, p.y)) // 0 on top
        c.lerp(WHITE, smooth(0.42, 0.22, angle) * smooth(0.0, 0.05, p.z))
      },
    )

    // Lower jaw: pink mouth floor on top, white chin underneath. Hinges open for panting.
    const jaw = paint(
      snoutGeometry(
        [
          [0, 0],
          [0.052, 0],
          [0.049, 0.07],
          [0.041, 0.13],
          [0.029, 0.165],
          [0, 0.175],
        ],
        0.5,
      ),
      (p, c) => {
        const under = Math.abs(Math.atan2(p.x, -p.y)) // 0 underneath, π on top
        c.lerp(WHITE, smooth(1.3, 0.8, under) * smooth(0.02, 0.08, p.z))
        // the inside of the mouth, painted on rather than a separate piece that could poke through
        c.lerp(MOUTH, smooth(2.2, 2.6, under) * smooth(0.02, 0.05, p.z) * smooth(0.17, 0.15, p.z))
      },
    )

    // Body: one long lean capsule along z with the white bib on the chest.
    const body = paint(
      (() => {
        const g = new CapsuleGeometry(0.135, 0.62, 8, 24)
        g.rotateX(Math.PI / 2)
        return g
      })(),
      (p, c) => {
        c.lerp(WHITE, smooth(0.22, 0.34, p.z) * smooth(0.02, -0.07, p.y) * smooth(0.11, 0.05, Math.abs(p.x)))
      },
    )

    // a hint of the bib on the front of the lower neck
    const neck = paint(new CapsuleGeometry(0.09, 0.12, 6, 18), (p, c) => {
      c.lerp(WHITE, smooth(0.03, 0.07, p.z) * smooth(-0.04, -0.1, p.y) * 0.8)
    })

    // Semi-folded ears: a soft cone whose top half bends forward.
    const ear = new ConeGeometry(0.072, 0.17, 18, 10)
    const pos = ear.attributes.position
    const v = new Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      if (v.y > 0) {
        const bend = (v.y / 0.075) * 1.9
        const y = v.y
        v.y = Math.cos(bend) * y * 0.7 + 0.0
        v.z = v.z + Math.sin(bend) * y * 0.9
      }
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    ear.scale(1, 1, 0.45)
    ear.computeVertexNormals()

    const frontLeg = legGeometry(0.036, 0.3)
    const hindLeg = legGeometry(0.036, 0.24)

    const tail = new TubeGeometry(
      new CatmullRomCurve3([
        new Vector3(0, 0.15, -0.45),
        new Vector3(-0.08, 0.11, -0.58),
        new Vector3(-0.22, 0.07, -0.56),
        new Vector3(-0.3, 0.05, -0.4),
        new Vector3(-0.3, 0.05, -0.25),
      ]),
      24,
      0.022,
      8,
    )

    return { head, snout, jaw, body, neck, ear, frontLeg, hindLeg, tail }
  }, [])
}

// Eyes sit on the head's surface, pushed slightly in so only a dome shows.
const EYES = [-1, 1].map((side) => ({ side, position: [side * 0.054, 0.026, 0.109] as [number, number, number] }))

// The upper muzzle sits here inside the head, so it reads as one continuous shape.
const SNOUT_BASE: [number, number, number] = [0, -0.035, 0.07]

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

/**
 * Goose lying in his bed. He watches whatever you hover, otherwise follows you around the room
 * and glances about; every so often he opens his mouth for a happy pant. He breathes slowly and
 * his tail wags, faster when you hover him.
 */
export function Goose({ animate, excited }: { animate: boolean; excited: boolean }) {
  const g = useGooseGeometry()
  const tail = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const jaw = useRef<Group>(null)
  const tongue = useRef<Group>(null)

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
        const spotIndex = animate ? idle.current.spot : -1
        if (spotIndex >= 0) lookAt.set(...GLANCES[spotIndex])
        else lookAt.copy(camera.position)
      }
      h.parent.worldToLocal(lookAt)
      const dx = lookAt.x - h.position.x
      const dy = lookAt.y - h.position.y
      const dz = lookAt.z - h.position.z
      const yaw = clamp(Math.atan2(dx, dz) + pointer.x * 0.3, -1.1, 1.1)
      const pitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)) - pointer.y * 0.12, -0.5, 0.3)
      // a curious little head tilt, more when excited
      const tilt = (excited ? 0.16 : 0.06) + (animate ? Math.sin(t * 0.7) * 0.06 : 0)
      const ease = animate ? Math.min(1, delta * 3) : 1
      h.rotation.y += (yaw - h.rotation.y) * ease
      h.rotation.x += (pitch - h.rotation.x) * ease
      h.rotation.z += (tilt - h.rotation.z) * ease
    }

    // Mouth: every few seconds he either relaxes with it closed or opens up for a happy pant.
    const m = mouth.current
    if (animate && t > m.until) {
      m.panting = Math.random() < 0.6
      m.until = t + (m.panting ? 2 + Math.random() * 3 : 1.5 + Math.random() * 2.5)
    }
    const panting = excited || (animate && m.panting)
    m.open += ((panting ? 1 : 0) - m.open) * (animate ? Math.min(1, delta * 5) : 1)
    const pant = animate ? Math.sin(t * (excited ? 15 : 11)) : 0
    if (jaw.current) jaw.current.rotation.x = m.open * (0.3 + pant * 0.06)
    if (tongue.current) {
      // the tip only exists while the mouth is open, drooping over the lip
      tongue.current.scale.setScalar(Math.max(0.001, m.open))
      tongue.current.rotation.x = m.open * (0.9 + pant * 0.12)
    }

    if (!animate) return
    if (tail.current) tail.current.rotation.y = Math.sin(t * (excited ? 14 : panting ? 5 : 2)) * (excited ? 0.4 : 0.12)
    if (body.current) {
      // panting means quick, shallow breaths; otherwise slow and deep
      const breath = panting ? Math.sin(t * 11) * 0.012 : Math.sin(t * 2.2) * 0.025
      body.current.scale.set(1 + breath * 0.7, 1 + breath, 1)
    }
  })

  const coat = <meshStandardMaterial vertexColors roughness={0.6} />

  return (
    <group>
      {/* bed: base, cushion, and a raised rim */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1, 0.12, 24]} />
        <meshStandardMaterial color={bedColor} roughness={1} />
      </mesh>
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.04, 24]} />
        <meshStandardMaterial color={cushion} roughness={1} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.88, 0.12, 10, 32]} />
        <meshStandardMaterial color={bedRim} roughness={1} />
      </mesh>

      {/* Goose, lying along +z with his head up, resting on the cushion */}
      <group position={[0, 0.15, -0.05]}>
        <group ref={body} position={[0, 0.13, 0]}>
          <mesh geometry={g.body} castShadow>
            {coat}
          </mesh>
        </group>

        {/* front legs stretched out, hind legs tucked along his side */}
        <mesh geometry={g.frontLeg} position={[-0.075, 0.035, 0.52]} castShadow>
          {coat}
        </mesh>
        <mesh geometry={g.frontLeg} position={[0.075, 0.035, 0.5]} rotation={[0, 0.1, 0]} castShadow>
          {coat}
        </mesh>
        <mesh position={[0.11, 0.13, -0.3]} scale={[0.09, 0.1, 0.15]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={COAT} roughness={0.5} />
        </mesh>
        <mesh geometry={g.hindLeg} position={[0.17, 0.035, -0.22]} rotation={[0, 0.12, 0]} castShadow>
          {coat}
        </mesh>

        {/* tail, curled around his side */}
        <group ref={tail}>
          <mesh geometry={g.tail} castShadow>
            <meshStandardMaterial color={COAT} roughness={0.5} />
          </mesh>
        </group>

        {/* neck with a low orange collar and a little tag */}
        <mesh geometry={g.neck} position={[0, 0.3, 0.4]} rotation={[0.55, 0, 0]} castShadow>
          {coat}
        </mesh>
        <mesh position={[0, 0.257, 0.374]} rotation={[0.55 - Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.094, 0.016, 8, 28]} />
          <meshStandardMaterial color={collarColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0.45]}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshStandardMaterial color="#e2c37a" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* head */}
        {/* YXZ order: turn (yaw) first, then look up or down, like a real neck. */}
        <group ref={head} position={[0, 0.43, 0.49]} rotation={[0, 0.4, 0.08, 'YXZ']}>
          <mesh geometry={g.head} scale={[0.135, 0.125, 0.13]} castShadow>
            {coat}
          </mesh>

          {/* one long, tapered snout with a button nose */}
          <mesh geometry={g.snout} position={SNOUT_BASE} castShadow>
            {coat}
          </mesh>
          <mesh position={[SNOUT_BASE[0], SNOUT_BASE[1] + 0.008, SNOUT_BASE[2] + 0.232]} scale={[1.15, 0.85, 0.8]}>
            <sphereGeometry args={[0.026, 16, 12]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.25} />
          </mesh>

          {/* lower jaw, mouth, and tongue: hinged at the back so he can pant */}
          <group ref={jaw} position={[0, -0.065, 0.075]}>
            <mesh geometry={g.jaw} castShadow>
              {coat}
            </mesh>
            {/* tongue: rests on the mouth floor; the tip slides out and droops over the front
                of the lower lip only while panting, so it never cuts through the jaw */}
            <mesh position={[0, 0.021, 0.1]} scale={[0.024, 0.006, 0.065]}>
              <sphereGeometry args={[1, 20, 14]} />
              <meshStandardMaterial color={tongueColor} roughness={0.45} />
            </mesh>
            <group ref={tongue} position={[0, 0.016, 0.168]}>
              <mesh position={[0, 0, 0.026]} scale={[0.021, 0.006, 0.03]}>
                <sphereGeometry args={[1, 20, 14]} />
                <meshStandardMaterial color={tongueColor} roughness={0.45} />
              </mesh>
            </group>
          </group>

          {/* big, warm eyes, set into the face as glossy domes */}
          {EYES.map((eye) => (
            <group key={eye.side} position={eye.position} rotation={[-0.15, eye.side * 0.48, 0]}>
              <mesh scale={[1, 1, 0.55]}>
                <sphereGeometry args={[0.024, 24, 18]} />
                <meshStandardMaterial color="#3f2412" roughness={0.12} />
              </mesh>
              <mesh position={[0.007, 0.008, 0.011]} scale={[1, 1, 0.4]}>
                <sphereGeometry args={[0.0065, 12, 10]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[-0.006, -0.007, 0.012]} scale={[1, 1, 0.4]}>
                <sphereGeometry args={[0.003, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}

          {/* semi-folded ears, tips flopping forward */}
          {[-1, 1].map((side) => (
            <mesh key={side} geometry={g.ear} position={[side * 0.095, 0.1, -0.02]} rotation={[0.1, side * 0.25, -side * 0.75]} castShadow>
              <meshStandardMaterial color={COAT} roughness={0.5} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
