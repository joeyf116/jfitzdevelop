import { useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Group } from 'three'
import type { ChapterId } from '../data/resume'
import { goToChapter } from '../scroll/scrollStore'
import { setHovered as setHoveredLabel } from './hotspots'

interface InteractiveProps {
  chapter: ChapterId
  animate: boolean
  children: ReactNode
}

/** Wraps a scene object that opens a chapter. It lifts and shows its label on hover. */
export function Interactive({ chapter, animate, children }: InteractiveProps) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const invalidate = useThree((state) => state.invalidate)
  useCursor(hovered)

  useEffect(() => {
    setHoveredLabel(hovered ? chapter : null)
    invalidate()
  }, [hovered, chapter, invalidate])

  useFrame((_, delta) => {
    if (!group.current) return
    const lift = hovered ? 0.06 : 0
    group.current.position.y = animate
      ? group.current.position.y + (lift - group.current.position.y) * Math.min(1, delta * 10)
      : lift
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
      {children}
    </group>
  )
}
