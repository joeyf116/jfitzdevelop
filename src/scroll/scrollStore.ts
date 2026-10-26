import Lenis from 'lenis'
import { useSyncExternalStore } from 'react'
import { chapters, type ChapterId } from '../data/resume'
import { isMotionEnabled } from '../motion/motionStore'

// The page scroll position is the single source of truth for where the visitor is.
// It's expressed as a fractional chapter index (0 = intro, 1 = about, ...): the 3D scene
// reads `progress` every frame, and React UI subscribes to the rounded `active` chapter.
//
// A "flight" is a click-triggered move to a chapter. The page smooth-scrolls to the chapter
// while the camera glides straight to its object (instead of touring every stop in between),
// and both take the same time. Any scroll, swipe, or scrolling key from the visitor
// interrupts a flight immediately and hands control back to the scroll position.
export interface Flight {
  index: number
  /** Seconds; shared by the page scroll and the camera so they land together. */
  duration: number
  id: number
}

const state = { progress: 0, active: 0, flight: null as Flight | null, sceneReady: false }
const listeners = new Set<() => void>()
let lenis: Lenis | null = null
let flightCount = 0

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
  // During a flight the destination is already the active chapter, so the panels the page
  // scrolls past on the way stay hidden.
  if (!state.flight) state.active = Math.round(progress)
  notify()
}

function endFlight(id: number) {
  if (state.flight?.id !== id) return
  state.flight = null
  measure()
}

/** The visitor took over (scroll, swipe, or keys): drop any flight or settle and stop the scroll animation. */
function interruptFlight(stopScroll: boolean) {
  const wasAnimating = state.flight !== null || settling
  settling = false
  if (!wasAnimating) return
  state.flight = null
  if (stopScroll) lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
  measure()
}

// When scrolling comes to rest partway between two chapters (the camera halfway between two
// objects), glide to whichever chapter is closer, like a soft scroll snap. Inside a chapter
// (including long ones like Experience) the progress is a whole number, so reading is never
// interrupted.
const SETTLE_DELAY = 220
const SETTLE_BAND = 0.08
let settling = false
let pointerDown = false

function settleToNearestChapter() {
  if (!lenis || state.flight || pointerDown) return
  const fraction = state.progress - Math.floor(state.progress)
  if (fraction < SETTLE_BAND || fraction > 1 - SETTLE_BAND) return
  const vh = window.innerHeight
  const next = chapters[Math.floor(state.progress) + 1]
  const boundaryEl = next && document.getElementById(next.id)
  if (!boundaryEl) return
  const boundary = boundaryEl.getBoundingClientRect().top + window.scrollY
  // Forward: land with the next chapter at the top. Back: land just before its transition starts.
  const target = fraction >= 0.5 ? boundary - navOffset() : boundary - vh * 0.9 - 1
  settling = true
  lenis.scrollTo(Math.max(0, target), {
    duration: 0.9,
    easing: easeInOutSine,
    force: true,
    onComplete: () => {
      settling = false
    },
  })
}

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

/** Starts scroll tracking, with inertial smooth scrolling when motion is on. */
export function startScrollTracking(smooth: boolean) {
  let frame = 0
  let idle = 0
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(measure)
    // Once the scroll has been still for a moment, settle onto the nearest chapter.
    window.clearTimeout(idle)
    if (!settling) idle = window.setTimeout(settleToNearestChapter, SETTLE_DELAY)
  }
  // Lenis retargets its own animation on wheel input, so it only needs the flight dropped.
  const onWheel = () => interruptFlight(false)
  // Touch and keyboard scroll natively, so the programmatic scroll has to be stopped too.
  const onTouch = () => {
    pointerDown = true
    interruptFlight(true)
  }
  const onTouchEnd = () => {
    pointerDown = false
    schedule()
  }
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) interruptFlight(true)
  }

  if (smooth) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.07, wheelMultiplier: 0.85, anchors: true })
    lenis.on('scroll', schedule)
  }
  measure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('touchstart', onTouch, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('touchcancel', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKey)
  const observer = new ResizeObserver(schedule)
  observer.observe(document.body)
  return () => {
    cancelAnimationFrame(frame)
    window.clearTimeout(idle)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('touchstart', onTouch)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
    window.removeEventListener('keydown', onKey)
    observer.disconnect()
    lenis?.destroy()
    lenis = null
    state.flight = null
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

// Matches the camera's flight easing so the page and the camera move in step.
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * Go to a chapter. With motion on and the 3D scene running, this starts a flight: the page
 * smooth-scrolls there while the camera glides to the chapter's object. Otherwise the page
 * jumps straight there.
 */
export function goToChapter(id: ChapterId) {
  const section = document.getElementById(id)
  const index = chapters.findIndex((chapter) => chapter.id === id)
  if (!section || index < 0) return

  section.querySelector<HTMLElement>('[data-chapter-heading]')?.focus({ preventScroll: true })
  settling = false

  if (!isMotionEnabled() || !lenis) {
    state.flight = null
    section.scrollIntoView({ behavior: 'auto', block: 'start' })
    return
  }
  if (!state.sceneReady) {
    // No 3D scene (no WebGL): just smooth-scroll the page.
    lenis.scrollTo(section, { offset: -navOffset(), duration: 1.6, easing: easeInOutSine, force: true })
    return
  }

  // Farther trips take a little longer, within limits.
  const distance = Math.abs(index - state.progress)
  const duration = Math.min(3, 1.6 + distance * 0.35)
  const flight: Flight = { index, duration, id: ++flightCount }
  state.flight = flight
  state.active = index
  notify()

  lenis.scrollTo(section, {
    offset: -navOffset(),
    duration,
    easing: easeInOutSine,
    force: true,
    onComplete: () => endFlight(flight.id),
  })
  // Safety net in case the scroll animation is replaced without completing.
  window.setTimeout(() => endFlight(flight.id), (duration + 1) * 1000)
}
