import { Vector3 } from 'three'
import type { ChapterId } from '../data/resume'

export const FOV = 32
const TAN_HALF = Math.tan((FOV * Math.PI) / 360)

export interface CameraStop {
  position: Vector3
  target: Vector3
  /** World-space width of the subject that must stay visible. */
  width: number
  /** Screen shift as a fraction of the canvas, so the subject clears the text panel. */
  offset: { landscape: [number, number]; portrait: [number, number] }
}

// Overview of the whole room, pulled back to fit any screen shape.
const OVERVIEW_TARGET = new Vector3(0, 1.7, -0.9)
const OVERVIEW_DIRECTION = new Vector3(1, 0.72, 1).normalize()
const ROOM_HALF_WIDTH = 4.2
const ROOM_HALF_HEIGHT = 3.3

function overview(aspect: number): CameraStop {
  const usable = aspect > 1 ? 0.6 : 1
  const distance = Math.max(ROOM_HALF_HEIGHT / TAN_HALF, ROOM_HALF_WIDTH / (TAN_HALF * aspect * usable))
  return {
    position: OVERVIEW_TARGET.clone().addScaledVector(OVERVIEW_DIRECTION, distance),
    target: OVERVIEW_TARGET,
    width: ROOM_HALF_WIDTH * 2,
    offset: { landscape: [0.2, 0], portrait: [0, -0.12] },
  }
}

const closeUps: Record<Exclude<ChapterId, 'intro'>, CameraStop> = {
  about: {
    position: new Vector3(1.4, 2.95, 0.6),
    target: new Vector3(1.6, 2.95, -2.95),
    width: 2,
    offset: { landscape: [0.2, 0], portrait: [0, 0.16] },
  },
  skills: {
    position: new Vector3(-0.8, 3.45, 0.3),
    target: new Vector3(-1.2, 3.35, -2.8),
    width: 2.3,
    offset: { landscape: [0.2, 0], portrait: [0, 0.16] },
  },
  experience: {
    position: new Vector3(0.3, 2.55, 0.1),
    target: new Vector3(0.1, 2.4, -2.5),
    width: 2.5,
    offset: { landscape: [0.2, 0], portrait: [0, 0.16] },
  },
  contact: {
    position: new Vector3(-0.3, 2.85, -0.2),
    target: new Vector3(-0.75, 1.6, -2),
    width: 2.2,
    offset: { landscape: [0.2, 0], portrait: [0, 0.16] },
  },
}

const order: ChapterId[] = ['intro', 'about', 'skills', 'experience', 'contact']

/**
 * Camera stop for a chapter, pulled back on narrow screens so the subject still fits.
 * On landscape screens only ~60% of the width is free beside the text panel.
 */
export function resolveStop(index: number, aspect: number): CameraStop {
  const id = order[Math.min(order.length - 1, Math.max(0, index))]
  if (id === 'intro') return overview(aspect)
  const stop = closeUps[id]
  const usable = aspect > 1 ? 0.6 : 1
  const distance = stop.position.distanceTo(stop.target)
  const needed = stop.width / (2 * TAN_HALF * aspect * usable)
  const scale = Math.max(1, needed / distance)
  return {
    ...stop,
    position: stop.target.clone().lerp(stop.position, scale),
  }
}

export const STOP_COUNT = order.length
