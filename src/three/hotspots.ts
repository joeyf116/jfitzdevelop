import { useSyncExternalStore } from 'react'
import type { ChapterId } from '../data/resume'

// Kept free of three.js imports so the DOM labels don't pull it into the main bundle.
// Clickable objects in the room and where their labels float, in world space.
export const hotspots: { chapter: ChapterId; label: string; position: [number, number, number] }[] = [
  { chapter: 'about', label: 'About me', position: [1.6, 3.65, -2.9] },
  { chapter: 'skills', label: 'Skills', position: [-1.4, 3.95, -2.8] },
  { chapter: 'experience', label: 'Experience', position: [-2.9, 3.25, -2.2] },
  { chapter: 'projects', label: 'Projects', position: [0.35, 3.3, -2.5] },
  { chapter: 'contact', label: 'Contact', position: [-0.85, 1.85, -1.8] },
]

// Label elements live in the DOM (outside the canvas); the scene positions them each frame.
export const labelElements = new Map<ChapterId, HTMLElement>()

let hovered: ChapterId | null = null
const listeners = new Set<() => void>()

export function setHovered(chapter: ChapterId | null) {
  if (hovered === chapter) return
  hovered = chapter
  listeners.forEach((listener) => listener())
}

export function useHovered() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => hovered,
    () => null,
  )
}
