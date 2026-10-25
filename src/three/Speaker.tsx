import { useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { musicLevel, toggleMusic, useMusicPlaying } from '../audio/musicStore'
import { palette } from '../theme/palette'
import { Box, Cylinder } from './parts'

const cabinet = '#5a3a24'
const grille = '#1d2230'

/** A retro floor speaker. Click it to play or stop the lofi; its cones pump with the music. */
export function Speaker({ animate }: { animate: boolean }) {
  const playing = useMusicPlaying()
  const [hovered, setHovered] = useState(false)
  const woofer = useRef<Group>(null)
  const tweeter = useRef<Group>(null)
  const led = useRef<Mesh>(null)
  const notes = useRef<Group>(null)
  useCursor(hovered)

  useFrame(({ clock }) => {
    const level = musicLevel()
    const pump = animate ? level : 0
    if (woofer.current) woofer.current.scale.set(1 + pump * 0.08, 1 + pump * 0.08, 1 + pump * 1.4)
    if (tweeter.current) tweeter.current.scale.set(1, 1, 1 + pump * 0.8)
    if (led.current) {
      const material = led.current.material as MeshStandardMaterial
      material.emissiveIntensity = playing ? 1.5 + level * 3 : 0.2
    }
    if (notes.current) {
      notes.current.visible = playing && animate
      notes.current.children.forEach((note, i) => {
        const t = (clock.elapsedTime * 0.35 + i / 3) % 1
        note.position.set(Math.sin((t + i) * 5) * 0.12, 1.2 + t * 0.9, 0.1)
        note.scale.setScalar(Math.sin(t * Math.PI) * 0.9 + 0.05)
      })
    }
  })

  const toggle = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    void toggleMusic()
  }

  return (
    <group
      onClick={toggle}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* cabinet on short legs */}
      <Box size={[0.55, 1, 0.45]} color={cabinet} position={[0, 0.62, 0]} roughness={0.6} />
      {[-0.2, 0.2].map((x) =>
        [-0.15, 0.15].map((z) => <Cylinder key={`${x}${z}`} radiusTop={0.025} height={0.12} color={palette.metal} position={[x, 0.06, z]} segments={6} />),
      )}
      <Box size={[0.48, 0.92, 0.02]} color={grille} position={[0, 0.62, 0.226]} roughness={0.95} />
      {/* woofer and tweeter cones */}
      <group ref={woofer} position={[0, 0.48, 0.24]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.17, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#2a3040" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#3a4254" />
        </mesh>
      </group>
      <group ref={tweeter} position={[0, 0.88, 0.24]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.05, 0.03, 16]} />
          <meshStandardMaterial color="#2a3040" roughness={0.6} />
        </mesh>
      </group>
      {/* power light */}
      <mesh ref={led} position={[0.19, 1.05, 0.24]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color={palette.code[1]} emissive={palette.code[1]} emissiveIntensity={0.2} toneMapped={false} />
      </mesh>
      {/* floating music notes while playing */}
      <group ref={notes} visible={false}>
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <mesh>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshBasicMaterial color={palette.lampLight} toneMapped={false} />
            </mesh>
            <mesh position={[0.03, 0.07, 0]}>
              <boxGeometry args={[0.008, 0.14, 0.008]} />
              <meshBasicMaterial color={palette.lampLight} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      {/* soft glow on hover so it reads as clickable */}
      <pointLight position={[0, 0.9, 0.6]} color={palette.accent} intensity={hovered ? 2.5 : 0} distance={1.6} decay={2} />
    </group>
  )
}
