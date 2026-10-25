import { useSyncExternalStore } from 'react'

// Whether the site animates (camera flights, smooth scrolling, ambient effects).
// Defaults to the OS "reduce motion" setting; visitors can override it from the nav.
const STORAGE_KEY = 'motion'
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const listeners = new Set<() => void>()

function readSaved(): boolean | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'on' ? true : saved === 'off' ? false : null
  } catch {
    return null
  }
}

let enabled = readSaved() ?? !reduceQuery.matches

function apply() {
  document.documentElement.dataset.motion = enabled ? 'on' : 'off'
  listeners.forEach((listener) => listener())
}

apply()

reduceQuery.addEventListener('change', () => {
  if (readSaved() !== null) return
  enabled = !reduceQuery.matches
  apply()
})

export function isMotionEnabled() {
  return enabled
}

export function setMotionEnabled(next: boolean) {
  enabled = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
  apply()
}

export function useMotionEnabled() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => enabled,
    () => true,
  )
}
