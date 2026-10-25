import Lenis from 'lenis'
import { useSyncExternalStore } from 'react'
import { chapters, type ChapterId } from '../data/resume'
import { isMotionEnabled } from '../motion/motionStore'

// Scroll position expressed as a fractional chapter index (0 = intro, 1 = about, ...).
// The 3D scene reads `progress` every frame; React UI subscribes to the rounded `active` chapter.
//
// A "flight" is a click-triggered camera move: the camera glides to a chapter's object first,
// then the page jumps to that chapter underneath it, so clicks never feel like a cut.
interface Flight {
  index: number
  arrive: () => void
}

const state = { progress: 0, active: 0, flight: null as Flight | null, sceneReady: false }
const listeners = new Set<() => void>()
let lenis: Lenis | null = null

function notify() {
  listeners.forEach((listener) => listener())
}

export function getProgress() {
  return state.progress
}

export function getFlight() {
  return state.flight
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Called by the scene once WebGL is up, so clicks know a camera flight is possible. */
export function markSceneReady() {
  state.sceneReady = true
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
  // During a flight the destination is already the active chapter.
  if (!state.flight) state.active = Math.round(progress)
  notify()
}

/** Starts scroll tracking, with inertial smooth scrolling when motion is on. */
export function startScrollTracking(smooth: boolean) {
  let frame = 0
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(measure)
  }
  if (smooth) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.06, wheelMultiplier: 0.85, anchors: true })
    lenis.on('scroll', schedule)
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
    lenis?.destroy()
    lenis = null
  }
}

export function useActiveChapter() {
  return useSyncExternalStore(
    subscribe,
    () => state.active,
    () => 0,
  )
}

function navOffset() {
  return document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0
}

function scrollToSection(section: HTMLElement, immediate: boolean) {
  if (lenis) {
    lenis.scrollTo(section, { offset: -navOffset(), immediate, force: true, duration: 1.8 })
  } else {
    section.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}

/**
 * Go to a chapter. With motion on and the 3D scene running, the camera flies there first
 * and the page follows when it lands; otherwise the page scrolls straight there.
 */
export function goToChapter(id: ChapterId) {
  const section = document.getElementById(id)
  const index = chapters.findIndex((chapter) => chapter.id === id)
  if (!section || index < 0) return

  const focusHeading = () => section.querySelector<HTMLElement>('[data-chapter-heading]')?.focus({ preventScroll: true })

  if (!isMotionEnabled() || !state.sceneReady) {
    scrollToSection(section, !isMotionEnabled())
    focusHeading()
    return
  }

  lenis?.stop()
  state.flight = {
    index,
    arrive: () => {
      lenis?.start()
      scrollToSection(section, true)
      focusHeading()
    },
  }
  state.active = index
  notify()
}

/** Called by the camera rig when a flight lands. */
export function endFlight() {
  const flight = state.flight
  state.flight = null
  flight?.arrive()
  measure()
}
