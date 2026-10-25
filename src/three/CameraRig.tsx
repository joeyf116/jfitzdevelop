import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector2, Vector3, type PerspectiveCamera } from 'three'
import { getProgress, subscribe } from '../scroll/scrollStore'
import { resolveStop, STOP_COUNT } from './cameraStops'

/**
 * Moves the camera between chapter stops as the page scrolls.
 * With motion enabled it eases toward the scroll position and drifts slightly
 * with the pointer; with reduced motion it cuts straight to the nearest stop.
 */
export function CameraRig({ animate }: { animate: boolean }) {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const invalidate = useThree((state) => state.invalidate)
  const size = useThree((state) => state.size)
  const currentRef = useRef({ position: new Vector3(), target: new Vector3(), offset: new Vector2(), ready: false })
  const goalRef = useRef({ position: new Vector3(), target: new Vector3(), offset: new Vector2() })

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
    const current = currentRef.current
    const goal = goalRef.current
    const { width, height } = state.size
    const aspect = width / height
    const progress = animate ? getProgress() : Math.round(getProgress())
    const index = Math.min(STOP_COUNT - 1, Math.floor(progress))
    const t = progress - index
    const from = resolveStop(index, aspect)
    const to = resolveStop(index + 1, aspect)
    const shape = aspect > 1 ? 'landscape' : 'portrait'

    goal.position.lerpVectors(from.position, to.position, t)
    goal.target.lerpVectors(from.target, to.target, t)
    goal.offset.set(
      from.offset[shape][0] + (to.offset[shape][0] - from.offset[shape][0]) * t,
      from.offset[shape][1] + (to.offset[shape][1] - from.offset[shape][1]) * t,
    )

    if (animate) {
      // Pointer drift, scaled by distance so close-ups don't swing wildly.
      const distance = goal.position.distanceTo(goal.target)
      goal.position.x += state.pointer.x * distance * 0.04
      goal.position.y += state.pointer.y * distance * 0.025
    }

    if (!animate || !current.ready) {
      current.position.copy(goal.position)
      current.target.copy(goal.target)
      current.offset.copy(goal.offset)
      current.ready = true
    } else {
      const ease = 1 - Math.exp(-delta * 4)
      current.position.lerp(goal.position, ease)
      current.target.lerp(goal.target, ease)
      current.offset.lerp(goal.offset, ease)
    }

    camera.position.copy(current.position)
    camera.lookAt(current.target)
    camera.setViewOffset(width, height, -current.offset.x * width, current.offset.y * height, width, height)
    camera.updateProjectionMatrix()
  })

  return null
}
