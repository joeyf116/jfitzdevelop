import { useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Group, PointLight } from 'three'
import type { ChapterId } from '../data/resume'
import { goToChapter, useActiveChapter } from '../scroll/scrollStore'
import { palette } from '../theme/palette'
import { setGaze, setHovered as setHoveredLabel } from './hotspots'

interface InteractiveProps {
  chapter: ChapterId
  animate: boolean
  /** Where the soft glow light sits, relative to the group. */
  glow: [number, number, number]
  /** Whether Goose looks at this object while it's hovered. */
  gazeAtMe?: boolean
  /** Children can be a function to react to hover (Goose wags harder). */
  children: ReactNode | ((hovered: boolean) => ReactNode)
}

/**
 * Wraps a scene object that opens a chapter. On the overview it glows with a slow pulse
 * so visitors can see what's clickable; on hover it lifts and glows brighter.
 */
export function Interactive({ chapter, animate, glow, gazeAtMe = true, children }: InteractiveProps) {
  const group = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const [hovered, setHovered] = useState(false)
  const invalidate = useThree((state) => state.invalidate)
  const onIntro = useActiveChapter() === 0
  useCursor(hovered)

  useEffect(() => {
    setHoveredLabel(hovered ? chapter : null)
  }, [hovered, chapter])

  // Goose turns to look at whatever you're pointing at (but not at himself).
  useEffect(() => {
    if (!gazeAtMe || !hovered) return
    setGaze(glow)
    return () => setGaze(null)
  }, [hovered, gazeAtMe, glow])

  // In on-demand mode, redraw when the glow should change.
  useEffect(() => invalidate(), [hovered, onIntro, invalidate])

  useFrame(({ clock }, delta) => {
    if (group.current) {
      const lift = hovered ? 0.06 : 0
      group.current.position.y = animate
        ? group.current.position.y + (lift - group.current.position.y) * Math.min(1, delta * 10)
        : lift
    }
    if (light.current) {
      // Each object pulses on its own phase so the room feels alive rather than blinking in sync.
      const phase = chapter.length
      const pulse = animate ? 0.65 + 0.35 * Math.sin(clock.elapsedTime * 2 + phase) : 1
      const target = hovered ? 3.2 : onIntro ? 1.6 * pulse : 0
      light.current.intensity = animate ? light.current.intensity + (target - light.current.intensity) * Math.min(1, delta * 4) : target
    }
  })

  const open = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    goToChapter(chapter)
  }

  return (
    <group
      ref={group}
      onClick={open}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {typeof children === 'function' ? children(hovered) : children}
      <pointLight ref={light} position={glow} color={palette.accent} intensity={0} distance={1.8} decay={2} />
    </group>
  )
}
