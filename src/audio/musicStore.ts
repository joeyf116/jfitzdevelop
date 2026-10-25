import { useSyncExternalStore } from 'react'
import { LofiPlayer } from './lofi'

// Music is always off until a visitor turns it on (browsers block autoplay anyway).
const player = new LofiPlayer()
const listeners = new Set<() => void>()
let playing = false

function notify() {
  listeners.forEach((listener) => listener())
}

export async function toggleMusic() {
  if (playing) {
    player.stop()
    playing = false
  } else {
    playing = true
    notify()
    try {
      await player.start()
    } catch {
      playing = false
    }
  }
  notify()
}

/** Pre-render the loop once the page is idle so the first press of play starts right away. */
export function prepareMusic() {
  const run = () => void player.prepare()
  // Safari only recently gained requestIdleCallback; fall back to a short delay.
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 8000 })
  else globalThis.setTimeout(run, 3000)
}

/** Current loudness (0–1) for animating the speaker. */
export function musicLevel() {
  return playing ? player.level() : 0
}

export function useMusicPlaying() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => playing,
    () => false,
  )
}
