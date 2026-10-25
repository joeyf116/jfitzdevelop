import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Mesh } from 'three'
import { sceneColors, type ThemeName } from '../theme/themes'

interface HeroSceneProps {
  theme: ThemeName
  animate: boolean
}

function Blob({ color, animate }: { color: string; animate: boolean }) {
  const mesh = useRef<Mesh>(null)
  const viewport = useThree((state) => state.viewport)

  // Narrow screens: smaller blob above the headline. Wide screens: beside it.
  const wide = viewport.aspect > 1
  const scale = wide ? Math.min(1.6, viewport.height / 3, viewport.width / 7) : Math.min(1.4, viewport.width / 3)
  const position: [number, number, number] = wide ? [viewport.width / 4, 0, 0] : [0, viewport.height / 5, 0]

  // Ease the blob toward the pointer (mouse or touch).
  useFrame((state, delta) => {
    if (!mesh.current || !animate) return
    const { x, y } = state.pointer
    const ease = Math.min(1, delta * 3)
    mesh.current.rotation.y += (x * 0.6 - mesh.current.rotation.y) * ease
    mesh.current.rotation.x += (-y * 0.4 - mesh.current.rotation.x) * ease
  })

  return (
    <group position={position}>
      <Float speed={animate ? 1.5 : 0} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={mesh} scale={scale}>
          <icosahedronGeometry args={[1, 32]} />
          <MeshDistortMaterial color={color} distort={0.35} speed={animate ? 2 : 0} roughness={0.2} metalness={0.4} />
        </mesh>
      </Float>
    </group>
  )
}

// In on-demand mode, redraw once the scene is mounted and whenever the theme changes.
function RenderOnChange({ theme }: { theme: ThemeName }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    const id = requestAnimationFrame(() => invalidate())
    return () => cancelAnimationFrame(id)
  }, [theme, invalidate])
  return null
}

export default function HeroScene({ theme, animate }: HeroSceneProps) {
  const colors = sceneColors[theme]
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop={animate ? 'always' : 'demand'}
      aria-hidden="true"
    >
      <ambientLight intensity={colors.ambient} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[-4, -2, -2]} intensity={20} color={colors.secondary} />
      <Blob color={colors.primary} animate={animate} />
      {animate && <Sparkles count={60} scale={7} size={2} speed={0.4} color={colors.secondary} />}
      {!animate && <RenderOnChange theme={theme} />}
    </Canvas>
  )
}
