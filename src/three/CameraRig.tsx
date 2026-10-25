import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector2, Vector3, type PerspectiveCamera } from 'three'
import { endFlight, getFlight, getProgress, subscribe } from '../scroll/scrollStore'
import { resolveStop, STOP_COUNT } from './cameraStops'

interface Pose {
  position: Vector3
  target: Vector3
  offset: Vector2
}

const newPose = (): Pose => ({ position: new Vector3(), target: new Vector3(), offset: new Vector2() })

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

const away = new Vector3()

/**
 * Moves the camera between chapter stops.
 * - Scrolling: eases toward the pose for the current scroll position, with a slight pointer drift.
 * - Clicking an object: flies along a gentle arc to that object's stop, then hands back to scroll.
 * - Motion off: cuts straight to the nearest stop and renders on demand.
 */
export function CameraRig({ animate }: { animate: boolean }) {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const invalidate = useThree((state) => state.invalidate)
  const size = useThree((state) => state.size)
  const current = useRef({ ...newPose(), ready: false })
  const goal = useRef(newPose())
  const flight = useRef<{ index: number; from: Pose; start: number; duration: number } | null>(null)

  // In on-demand mode, redraw whenever the scroll position changes.
  useEffect(() => {
    if (animate) return
    const unsubscribe = subscribe(() => invalidate())
    // Draw the first frame one tick later: the render loop isn't active yet on mount.
    const first = requestAnimationFrame(() => invalidate())
    return () => {
      unsubscribe()
      cancelAnimationFrame(first)
    }
  }, [animate, invalidate, size])

  useFrame((state, delta) => {
    const cur = current.current
    const g = goal.current
    const { width, height } = state.size
    const aspect = width / height
    const shape = aspect > 1 ? 'landscape' : 'portrait'
    const now = state.clock.elapsedTime

    // Scroll-driven pose.
    const progress = animate ? getProgress() : Math.round(getProgress())
    const index = Math.min(STOP_COUNT - 1, Math.floor(progress))
    const t = progress - index
    const from = resolveStop(index, aspect)
    const to = resolveStop(index + 1, aspect)
    g.position.lerpVectors(from.position, to.position, t)
    g.target.lerpVectors(from.target, to.target, t)
    g.offset.set(
      from.offset[shape][0] + (to.offset[shape][0] - from.offset[shape][0]) * t,
      from.offset[shape][1] + (to.offset[shape][1] - from.offset[shape][1]) * t,
    )

    if (!cur.ready) {
      cur.position.copy(g.position)
      cur.target.copy(g.target)
      cur.offset.copy(g.offset)
      // Establishing shot: start high and far back, then settle into the room.
      if (animate) cur.position.sub(g.target).multiplyScalar(1.8).add(g.target).setY(cur.position.y + 4)
      cur.ready = true
    }

    // Click-triggered flight.
    const requested = animate ? getFlight() : null
    if (requested && flight.current?.index !== requested.index) {
      const from = newPose()
      from.position.copy(cur.position)
      from.target.copy(cur.target)
      from.offset.copy(cur.offset)
      const stop = resolveStop(requested.index, aspect)
      const distance = from.position.distanceTo(stop.position)
      flight.current = { index: requested.index, from, start: now, duration: Math.min(2.2, 1.1 + distance * 0.08) }
    }
    if (!requested) flight.current = null

    if (flight.current) {
      const f = flight.current
      const stop = resolveStop(f.index, aspect)
      const raw = Math.min(1, (now - f.start) / f.duration)
      const e = easeInOutCubic(raw)
      cur.position.lerpVectors(f.from.position, stop.position, e)
      cur.target.lerpVectors(f.from.target, stop.target, e)
      cur.offset.set(
        f.from.offset.x + (stop.offset[shape][0] - f.from.offset.x) * e,
        f.from.offset.y + (stop.offset[shape][1] - f.from.offset.y) * e,
      )
      // Pull back a little mid-flight so moves between objects read as a zoom out, then in.
      away.subVectors(cur.position, cur.target).normalize()
      cur.position.addScaledVector(away, Math.sin(Math.PI * e) * f.from.position.distanceTo(stop.position) * 0.25)
      if (raw >= 1) {
        flight.current = null
        endFlight()
      }
    } else if (!animate) {
      cur.position.copy(g.position)
      cur.target.copy(g.target)
      cur.offset.copy(g.offset)
    } else {
      // Pointer drift, scaled by distance so close-ups don't swing wildly.
      const distance = g.position.distanceTo(g.target)
      g.position.x += state.pointer.x * distance * 0.04
      g.position.y += state.pointer.y * distance * 0.025
      const ease = 1 - Math.exp(-delta * 3.2)
      cur.position.lerp(g.position, ease)
      cur.target.lerp(g.target, ease)
      cur.offset.lerp(g.offset, ease)
    }

    camera.position.copy(cur.position)
    camera.lookAt(cur.target)
    camera.setViewOffset(width, height, -cur.offset.x * width, cur.offset.y * height, width, height)
    camera.updateProjectionMatrix()
  })

  return null
}
