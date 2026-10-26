import { useSyncExternalStore } from 'react'
import { profile, type ChapterId } from '../data/resume'

// Kept free of three.js imports so the DOM labels don't pull it into the main bundle.
// Clickable objects in the room and where their labels float, in world space.
// Most open a chapter; the coffee cup links out instead.
export type HotspotId = ChapterId | 'coffee'

export interface Hotspot {
  id: HotspotId
  label: string
  position: [number, number, number]
  /** Chapter the hotspot opens; when absent, `href` is opened in a new tab. */
  chapter?: ChapterId
  href?: string
}

export const hotspots: Hotspot[] = [
  { id: 'about', chapter: 'about', label: 'About me', position: [1.75, 3.85, -2.9] },
  { id: 'skills', chapter: 'skills', label: 'Skills', position: [-1.4, 3.95, -2.8] },
  { id: 'experience', chapter: 'experience', label: 'Experience', position: [-2.9, 3.25, -2.2] },
  { id: 'projects', chapter: 'projects', label: 'Projects', position: [0.3, 3.05, -2.5] },
  { id: 'hobbies', chapter: 'hobbies', label: 'Hobbies', position: [-2, 2.05, -0.2] },
  { id: 'contact', chapter: 'contact', label: 'Contact', position: [-0.85, 1.85, -1.8] },
  { id: 'coffee', label: 'Buy me a coffee', href: profile.venmo, position: [1.2, 2.15, -2.15] },
]

/** Opens the Venmo page in a new tab (used by the coffee cup and its label). */
export function openVenmo() {
  window.open(profile.venmo, '_blank', 'noopener,noreferrer')
}

// Label elements live in the DOM (outside the canvas); the scene positions them each frame.
export const labelElements = new Map<HotspotId, HTMLElement>()

// Where Goose should look while something in the room is hovered (world space), or null.
let gaze: [number, number, number] | null = null

export function setGaze(target: [number, number, number] | null) {
  gaze = target
}

export function getGaze() {
  return gaze
}

let hovered: HotspotId | null = null
const listeners = new Set<() => void>()

export function setHovered(id: HotspotId | null) {
  if (hovered === id) return
  hovered = id
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
