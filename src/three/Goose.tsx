import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { Cylinder } from './parts'

// Goose: lean, long-legged, glossy black with brindle legs, tan brows and cheeks,
// a white chest blaze and muzzle patch, white toes, folded ears, and an orange collar.
const coat = '#17171c'
const brindle = '#7a5234'
const tan = '#b07a4a'
const white = '#f2efe9'
const tongue = '#e77a8f'
const collar = '#d9822b'
const bed = '#3a4254'

function Part({
  position,
  scale,
  color,
  rotation = [0, 0, 0],
  detail = 1,
}: {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  rotation?: [number, number, number]
  detail?: number
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={color} flatShading roughness={0.55} />
    </mesh>
  )
}

function Leg({ x, z, height, front }: { x: number; z: number; height: number; front: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <Cylinder radiusTop={front ? 0.055 : 0.07} radiusBottom={0.045} height={height} color={brindle} position={[0, height / 2 + 0.04, 0]} segments={6} roughness={0.6} />
      {/* white-tipped toes */}
      <Part position={[0, 0.04, 0.04]} scale={[0.07, 0.04, 0.09]} color={white} detail={0} />
    </group>
  )
}

/** Sitting on his bed, panting happily. His tail wags and he breathes while motion is on. */
export function Goose({ animate, excited }: { animate: boolean; excited: boolean }) {
  const tail = useRef<Group>(null)
  const chest = useRef<Group>(null)
  const head = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    if (tail.current) tail.current.rotation.y = Math.sin(t * (excited ? 18 : 6)) * (excited ? 0.7 : 0.35)
    if (chest.current) chest.current.scale.setScalar(1 + Math.sin(t * 7) * 0.015)
    if (head.current) head.current.rotation.z = Math.sin(t * 0.8) * 0.08 + (excited ? 0.18 : 0)
  })

  return (
    <group>
      {/* dog bed */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 0.9, 0.16, 20]} />
        <meshStandardMaterial color={bed} roughness={1} />
      </mesh>
      <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.78, 0.12, 8, 24]} />
        <meshStandardMaterial color="#4a5368" roughness={1} />
      </mesh>

      <group position={[0, 0.16, 0]}>
        {/* haunches and hind legs folded under */}
        <Part position={[-0.17, 0.3, -0.18]} scale={[0.17, 0.24, 0.3]} color={coat} />
        <Part position={[0.17, 0.3, -0.18]} scale={[0.17, 0.24, 0.3]} color={coat} />
        <Part position={[-0.2, 0.06, 0.02]} scale={[0.08, 0.05, 0.18]} color={brindle} detail={0} />
        <Part position={[0.2, 0.06, 0.02]} scale={[0.08, 0.05, 0.18]} color={brindle} detail={0} />
        <Part position={[-0.2, 0.04, 0.17]} scale={[0.07, 0.04, 0.08]} color={white} detail={0} />
        <Part position={[0.2, 0.04, 0.17]} scale={[0.07, 0.04, 0.08]} color={white} detail={0} />

        {/* torso, sitting upright */}
        <group ref={chest}>
          <Part position={[0, 0.62, -0.02]} scale={[0.22, 0.38, 0.24]} rotation={[0.35, 0, 0]} color={coat} />
          {/* white chest blaze */}
          <Part position={[0, 0.66, 0.17]} scale={[0.1, 0.2, 0.06]} rotation={[0.25, 0, 0]} color={white} />
        </group>

        {/* long front legs */}
        <Leg x={-0.1} z={0.16} height={0.5} front />
        <Leg x={0.1} z={0.16} height={0.5} front />

        {/* tail curling out behind */}
        <group ref={tail} position={[0, 0.16, -0.42]}>
          <Cylinder radiusTop={0.025} radiusBottom={0.045} height={0.42} color={coat} position={[0, 0.08, -0.17]} rotation={[-1.1, 0, 0]} segments={6} />
        </group>

        {/* collar */}
        <mesh position={[0, 0.94, 0.04]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
          <torusGeometry args={[0.13, 0.03, 6, 16]} />
          <meshStandardMaterial color={collar} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.86, 0.18]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#e2c37a" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, 1.1, 0.1]}>
          <Part position={[0, 0, 0]} scale={[0.17, 0.16, 0.18]} color={coat} />
          {/* long snout with a white patch and black nose */}
          <Part position={[0, -0.04, 0.2]} scale={[0.09, 0.08, 0.15]} color={coat} />
          <Part position={[0, 0.0, 0.27]} scale={[0.05, 0.035, 0.07]} color={white} detail={0} />
          <Part position={[0, 0.0, 0.35]} scale={[0.035, 0.03, 0.03]} color="#050506" detail={0} />
          {/* open mouth and tongue */}
          <Part position={[0, -0.1, 0.22]} scale={[0.07, 0.025, 0.1]} color="#2a0f14" detail={0} />
          <Part position={[0, -0.13, 0.25]} scale={[0.045, 0.02, 0.08]} rotation={[0.4, 0, 0]} color={tongue} detail={0} />
          {/* tan cheeks and eyebrow spots */}
          <Part position={[-0.1, -0.06, 0.12]} scale={[0.05, 0.04, 0.05]} color={tan} detail={0} />
          <Part position={[0.1, -0.06, 0.12]} scale={[0.05, 0.04, 0.05]} color={tan} detail={0} />
          <Part position={[-0.07, 0.09, 0.14]} scale={[0.025, 0.018, 0.02]} color={tan} detail={0} />
          <Part position={[0.07, 0.09, 0.14]} scale={[0.025, 0.018, 0.02]} color={tan} detail={0} />
          {/* eyes */}
          <Part position={[-0.07, 0.04, 0.16]} scale={[0.022, 0.022, 0.015]} color="#2a1a10" detail={0} />
          <Part position={[0.07, 0.04, 0.16]} scale={[0.022, 0.022, 0.015]} color="#2a1a10" detail={0} />
          {/* semi-floppy folded ears */}
          <Part position={[-0.13, 0.15, -0.02]} scale={[0.06, 0.1, 0.03]} rotation={[0.3, 0, 0.9]} color={coat} detail={0} />
          <Part position={[0.13, 0.15, -0.02]} scale={[0.06, 0.1, 0.03]} rotation={[0.3, 0, -0.9]} color={coat} detail={0} />
        </group>
      </group>
    </group>
  )
}
