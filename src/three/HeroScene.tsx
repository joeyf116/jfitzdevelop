import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ReactNode } from 'react'
import { Vector3, type Group, type PerspectiveCamera } from 'three'
import { palette } from '../theme/palette'
import { Room } from './Room'

const FOV = 32
const TARGET = new Vector3(0, 1.7, -0.9)
const VIEW_DIRECTION = new Vector3(1, 0.72, 1).normalize()
// Half the room's on-screen width and height, in world units, that must stay in view.
const HALF_WIDTH = 5
const HALF_HEIGHT = 3.3

// Pull the camera back far enough that the whole room fits any canvas shape.
function CameraRig() {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const { width, height } = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const aspect = width / height
    const tanHalf = Math.tan((FOV * Math.PI) / 360)
    const distance = Math.max(HALF_HEIGHT / tanHalf, HALF_WIDTH / (tanHalf * aspect))
    camera.position.copy(TARGET).addScaledVector(VIEW_DIRECTION, distance)
    camera.lookAt(TARGET)
    camera.updateProjectionMatrix()
    // Defer one frame: on first mount the render loop isn't active yet and would drop the request.
    const id = requestAnimationFrame(() => invalidate())
    return () => cancelAnimationFrame(id)
  }, [camera, width, height, invalidate])

  return null
}

// Turn the room a little toward the pointer (mouse or touch) for a sense of depth.
function Parallax({ animate, children }: { animate: boolean; children: ReactNode }) {
  const group = useRef<Group>(null)
  useFrame((state, delta) => {
    if (!group.current || !animate) return
    const ease = Math.min(1, delta * 2.5)
    group.current.rotation.y += (state.pointer.x * 0.12 - group.current.rotation.y) * ease
    group.current.rotation.x += (-state.pointer.y * 0.04 - group.current.rotation.x) * ease
  })
  return <group ref={group}>{children}</group>
}

export default function HeroScene({ animate }: { animate: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: FOV }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      // With reduced motion, only redraw when something changes (resize, lamp click).
      frameloop={animate ? 'always' : 'demand'}
      aria-label="A small 3D desk setup with a monitor typing code. Tap the lamp to switch it."
    >
      <CameraRig />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#c4d0ff', palette.floor, 0.9]} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.3}
        color="#d4dcff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <Parallax animate={animate}>
        <Room animate={animate} />
      </Parallax>
    </Canvas>
  )
}
