import { lazy, Suspense, useState } from 'react'
import { useMotionEnabled } from '../motion/motionStore'
import { HotspotLayer } from './HotspotLayer'

// Three.js is the heaviest dependency, so it loads after the text is on screen.
const Scene = lazy(() => import('../three/Scene'))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const webgl = supportsWebGL()

/** The room, fixed behind the page. Without WebGL the chapters still read fine on a soft gradient. */
export function SceneBackdrop() {
  const motion = useMotionEnabled()
  const [ready, setReady] = useState(false)
  return (
    <div className="backdrop" data-fallback={!webgl} data-ready={ready}>
      {webgl && (
        <Suspense fallback={null}>
          <Scene animate={motion} onReady={() => setReady(true)} />
          <HotspotLayer />
        </Suspense>
      )}
    </div>
  )
}
