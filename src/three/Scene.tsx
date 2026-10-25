import { Canvas } from '@react-three/fiber'
import { palette } from '../theme/palette'
import { CameraRig } from './CameraRig'
import { FOV } from './cameraStops'
import { HotspotProjector } from './HotspotProjector'
import { Room } from './Room'

export default function Scene({ animate }: { animate: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: FOV, position: [10, 8, 10] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      // With reduced motion, only redraw when something changes (scroll, resize, clicks).
      frameloop={animate ? 'always' : 'demand'}
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
    </Canvas>
  )
}
