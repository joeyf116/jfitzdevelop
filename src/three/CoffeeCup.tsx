import { useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Shape, type Group, type Mesh, type MeshStandardMaterial, type PointLight } from 'three'
import { useActiveChapter } from '../scroll/scrollStore'
import { palette } from '../theme/palette'
import { openVenmo, setGaze, setHovered as setHoveredLabel } from './hotspots'
import { Cylinder } from './parts'

const ceramic = '#e9e4da'
const coffee = '#4a2c1a'
const STEAM = [0, 1, 2]

/**
 * The coffee mug on the desk: a "Buy me a coffee" link to Joey's Venmo.
 * Steam curls up while motion is on; it lifts and glows on hover like the other objects.
 */
export function CoffeeCup({ animate, gaze }: { animate: boolean; gaze: [number, number, number] }) {
  const [hovered, setHovered] = useState(false)
  const cup = useRef<Group>(null)
  const glow = useRef<PointLight>(null)
  const steam = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const onIntro = useActiveChapter() === 0
  useCursor(hovered)

  useEffect(() => {
    setHoveredLabel(hovered ? 'coffee' : null)
    invalidate()
    if (!hovered) return
    setGaze(gaze)
    return () => setGaze(null)
  }, [hovered, gaze, invalidate])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    if (cup.current) {
      const lift = hovered ? 0.05 : 0
      cup.current.position.y = animate ? cup.current.position.y + (lift - cup.current.position.y) * Math.min(1, delta * 10) : lift
    }
    if (glow.current) {
      const pulse = animate ? 0.65 + 0.35 * Math.sin(t * 2 + 1.7) : 1
      const target = hovered ? 2.6 : onIntro ? 1.2 * pulse : 0
      glow.current.intensity = animate ? glow.current.intensity + (target - glow.current.intensity) * Math.min(1, delta * 4) : target
    }
    if (steam.current) {
      steam.current.visible = animate
      steam.current.children.forEach((wisp, i) => {
        const p = (t * 0.35 + i / STEAM.length) % 1
        wisp.position.set(Math.sin(p * 6 + i * 2) * 0.03, 0.26 + p * 0.35, Math.cos(p * 5 + i) * 0.02)
        wisp.scale.setScalar(0.6 + p * 1.2)
        const material = (wisp as Mesh).material as MeshStandardMaterial
        material.opacity = Math.sin(p * Math.PI) * 0.35
      })
    }
  })

  const open = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    openVenmo()
  }

  return (
    <group
      onClick={open}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={cup}>
        {/* saucer */}
        <Cylinder radiusTop={0.15} radiusBottom={0.12} height={0.02} color={ceramic} position={[0, 0.01, 0]} segments={28} roughness={0.35} />
        {/* cup, slightly tapered, with coffee inside */}
        <Cylinder radiusTop={0.095} radiusBottom={0.075} height={0.18} color={ceramic} position={[0, 0.11, 0]} segments={28} roughness={0.35} />
        <mesh position={[0, 0.192, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 28]} />
          <meshStandardMaterial color={coffee} roughness={0.2} />
        </mesh>
        {/* a little latte-art heart */}
        <mesh position={[0, 0.194, 0.005]} rotation={[-Math.PI / 2, 0, Math.PI]} scale={0.03}>
          <shapeGeometry args={[HEART]} />
          <meshStandardMaterial color="#d9b48a" roughness={0.4} />
        </mesh>
        {/* handle */}
        <mesh position={[0.1, 0.11, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.045, 0.014, 10, 20, Math.PI * 1.3]} />
          <meshStandardMaterial color={ceramic} roughness={0.35} />
        </mesh>
        {/* steam */}
        <group ref={steam}>
          {STEAM.map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.03, 10, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>
      <pointLight ref={glow} position={[0, 0.35, 0.25]} color={palette.lampLight} intensity={0} distance={1.2} decay={2} />
    </group>
  )
}

/** A small heart outline for the latte art. */
const HEART = (() => {
  const s = new Shape()
  s.moveTo(0, -0.8)
  s.bezierCurveTo(-1.2, 0, -0.7, 1, 0, 0.45)
  s.bezierCurveTo(0.7, 1, 1.2, 0, 0, -0.8)
  return s
})()
