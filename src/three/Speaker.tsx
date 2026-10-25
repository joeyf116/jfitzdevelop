import { useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { musicLevel, toggleMusic, useMusicPlaying } from '../audio/musicStore'
import { palette } from '../theme/palette'
import { setGaze } from './hotspots'
import { Box, Cylinder } from './parts'

// A classic British-style half stack: amp head on a 4x12 cab, black tolex, piping,
// a tan basketweave grille, and a gold control panel. (No real brand logo, just a script plate.)
const tolex = '#111114'
const piping = '#d9c7a0'
const grilleCloth = '#b9a47c'
const gold = '#c8a24a'
const metal = '#9aa3b2'

const CAB_W = 0.78
const CAB_H = 0.78
const CAB_D = 0.4
const HEAD_H = 0.3
const LEGS = 0.06

/** Click it to play or stop the lofi; the speakers pump with the music and the jewel light glows. */
export function Speaker({ animate, gaze }: { animate: boolean; gaze: [number, number, number] }) {
  const playing = useMusicPlaying()
  const [hovered, setHovered] = useState(false)
  const cones = useRef<Group>(null)
  const jewel = useRef<Mesh>(null)
  const notes = useRef<Group>(null)
  useCursor(hovered)

  // Goose looks over when the amp is hovered.
  useEffect(() => {
    if (!hovered) return
    setGaze(gaze)
    return () => setGaze(null)
  }, [hovered, gaze])

  useFrame(({ clock }) => {
    const level = musicLevel()
    const pump = animate ? level : 0
    cones.current?.children.forEach((cone, i) => {
      const s = 1 + pump * (0.12 + (i % 2) * 0.05)
      cone.scale.set(s, s, 1)
    })
    if (jewel.current) {
      const material = jewel.current.material as MeshStandardMaterial
      material.emissiveIntensity = playing ? 2 + level * 4 : 0.25
    }
    if (notes.current) {
      notes.current.visible = playing && animate
      notes.current.children.forEach((note, i) => {
        const t = (clock.elapsedTime * 0.35 + i / 3) % 1
        note.position.set(Math.sin((t + i) * 5) * 0.15, CAB_H + HEAD_H + 0.2 + t * 0.8, 0.1)
        note.scale.setScalar(Math.sin(t * Math.PI) * 0.9 + 0.05)
      })
    }
  })

  const toggle = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    void toggleMusic()
  }

  const front = CAB_D / 2
  const headY = LEGS + CAB_H + HEAD_H / 2 + 0.005

  return (
    <group
      onClick={toggle}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* casters */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <Cylinder key={`${x}${z}`} radiusTop={0.03} height={LEGS} color={metal} position={[x * (CAB_W / 2 - 0.06), LEGS / 2, z * (CAB_D / 2 - 0.06)]} segments={8} metalness={0.6} />
        )),
      )}

      {/* 4x12 cab */}
      <group position={[0, LEGS + CAB_H / 2, 0]}>
        <Box size={[CAB_W, CAB_H, CAB_D]} color={tolex} roughness={0.85} />
        {/* piping around the front */}
        <Box size={[CAB_W - 0.06, 0.012, 0.012]} color={piping} position={[0, CAB_H / 2 - 0.04, front + 0.002]} />
        <Box size={[CAB_W - 0.06, 0.012, 0.012]} color={piping} position={[0, -CAB_H / 2 + 0.04, front + 0.002]} />
        <Box size={[0.012, CAB_H - 0.08, 0.012]} color={piping} position={[CAB_W / 2 - 0.04, 0, front + 0.002]} />
        <Box size={[0.012, CAB_H - 0.08, 0.012]} color={piping} position={[-CAB_W / 2 + 0.04, 0, front + 0.002]} />
        {/* basketweave grille, with the four speakers showing through as darker rings */}
        <mesh position={[0, 0, front + 0.004]}>
          <planeGeometry args={[CAB_W - 0.12, CAB_H - 0.12]} />
          <meshStandardMaterial color={grilleCloth} roughness={1} />
        </mesh>
        <group ref={cones}>
          {[-1, 1].map((x) =>
            [-1, 1].map((y) => (
              <mesh key={`${x}${y}`} position={[x * 0.16, y * 0.16, front + 0.006]}>
                <ringGeometry args={[0.07, 0.13, 24]} />
                <meshStandardMaterial color="#8d7a58" roughness={1} transparent opacity={0.65} />
              </mesh>
            )),
          )}
        </group>
        {/* metal corner protectors */}
        {[-1, 1].map((x) =>
          [-1, 1].map((y) => (
            <Box key={`${x}${y}`} size={[0.06, 0.06, 0.02]} color={metal} position={[x * (CAB_W / 2 - 0.02), y * (CAB_H / 2 - 0.02), front + 0.006]} metalness={0.7} roughness={0.3} />
          )),
        )}
        {/* little script plate */}
        <Box size={[0.18, 0.05, 0.01]} color={piping} position={[-0.2, CAB_H / 2 - 0.1, front + 0.01]} />
      </group>

      {/* amp head */}
      <group position={[0, headY, 0]}>
        <Box size={[CAB_W, HEAD_H, CAB_D - 0.04]} color={tolex} roughness={0.85} />
        <Box size={[CAB_W - 0.06, 0.012, 0.012]} color={piping} position={[0, HEAD_H / 2 - 0.035, front - 0.018]} />
        {/* grille strip with the script plate */}
        <mesh position={[0, 0.045, front - 0.018]}>
          <planeGeometry args={[CAB_W - 0.1, 0.11]} />
          <meshStandardMaterial color={grilleCloth} roughness={1} />
        </mesh>
        <Box size={[0.22, 0.055, 0.012]} color="#f2efe9" position={[0, 0.045, front - 0.01]} roughness={0.4} />
        {/* gold control panel with knobs and the jewel power light */}
        <Box size={[CAB_W - 0.06, 0.08, 0.01]} color={gold} position={[0, -0.075, front - 0.015]} metalness={0.6} roughness={0.35} />
        {Array.from({ length: 6 }, (_, i) => (
          <Cylinder key={i} radiusTop={0.016} height={0.03} color="#1a1a1a" position={[-0.22 + i * 0.07, -0.075, front - 0.002]} rotation={[Math.PI / 2, 0, 0]} segments={10} />
        ))}
        <mesh ref={jewel} position={[0.3, -0.075, front - 0.002]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial color="#e04a3a" emissive="#e04a3a" emissiveIntensity={0.25} toneMapped={false} />
        </mesh>
        {/* carry handle */}
        <Box size={[0.22, 0.02, 0.05]} color={tolex} position={[0, HEAD_H / 2 + 0.012, 0]} />
      </group>

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
      <pointLight position={[0, 0.9, 0.7]} color={palette.accent} intensity={hovered ? 2.5 : 0} distance={1.8} decay={2} />
    </group>
  )
}
