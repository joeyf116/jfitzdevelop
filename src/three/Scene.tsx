import { Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { markSceneReady } from '../scroll/scrollStore'
import { palette } from '../theme/palette'
import { CameraRig } from './CameraRig'
import { FOV } from './cameraStops'
import { HotspotProjector } from './HotspotProjector'
import { Room } from './Room'

interface SceneProps {
  animate: boolean
  onReady: () => void
}

export default function Scene({ animate, onReady }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: FOV, position: [10, 8, 10] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      // With motion off, only redraw when something changes (scroll, resize, clicks).
      frameloop={animate ? 'always' : 'demand'}
      onCreated={() => {
        markSceneReady()
        onReady()
      }}
      aria-label="A 3D room with a desk. Select the wall frame, bookshelf, monitor, or phone to learn more."
    >
      <CameraRig animate={animate} />
      <HotspotProjector />
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
      <Room animate={animate} />
      {/* Dust drifting through the lamp light and the room. */}
      {animate && (
        <>
          <Sparkles count={40} scale={[1.6, 1.4, 1.2]} position={[-0.5, 2.1, -2.1]} size={2.5} speed={0.25} opacity={0.6} color={palette.lampLight} />
          <Sparkles count={50} scale={[5, 3.5, 5]} position={[0, 2, -0.5]} size={1.5} speed={0.15} opacity={0.35} color="#c4d0ff" />
        </>
      )}
    </Canvas>
  )
}
