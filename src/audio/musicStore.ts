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
