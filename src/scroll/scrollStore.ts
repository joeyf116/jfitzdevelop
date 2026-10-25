import { useSyncExternalStore } from 'react'
import { chapters, type ChapterId } from '../data/resume'

// Scroll position expressed as a fractional chapter index (0 = intro, 1 = about, ...).
// The 3D scene reads `progress` every frame; React UI subscribes to the rounded `active` chapter.
const state = { progress: 0, active: 0 }
const listeners = new Set<() => void>()

export function getProgress() {
  return state.progress
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

// Each chapter boundary contributes 0→1 as the middle of the viewport crosses it,
// so the camera eases between stops without jumps.
function measure() {
  const vh = window.innerHeight
  const center = window.scrollY + vh / 2
  let progress = 0
  for (let i = 1; i < chapters.length; i++) {
    const el = document.getElementById(chapters[i].id)
    if (!el) continue
    const boundary = el.getBoundingClientRect().top + window.scrollY
    progress += smoothstep((center - (boundary - vh * 0.4)) / (vh * 0.6))
  }
  state.progress = progress
  state.active = Math.round(progress)
  listeners.forEach((listener) => listener())
}

export function startScrollTracking() {
  let frame = 0
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(measure)
  }
  measure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  const observer = new ResizeObserver(schedule)
  observer.observe(document.body)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    observer.disconnect()
  }
}

export function useActiveChapter() {
  return useSyncExternalStore(
    subscribe,
    () => state.active,
    () => 0,
  )
}

// Scroll a chapter into view and move keyboard focus to its heading.
export function goToChapter(id: ChapterId) {
  const section = document.getElementById(id)
  if (!section) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  section.querySelector<HTMLElement>('[data-chapter-heading]')?.focus({ preventScroll: true })
}
