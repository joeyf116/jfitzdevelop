import { lazy, Suspense } from 'react'
import { profile } from '../data/resume'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// Three.js is the heaviest dependency, so it loads after the text is on screen.
const HeroScene = lazy(() => import('../three/HeroScene'))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const webgl = supportsWebGL()

export function Hero() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section id="top" className="hero">
      <div className="hero__content">
        <p className="eyebrow">{profile.subtitle}</p>
        <h1 className="hero__title">{profile.name}</h1>
        <p className="hero__lead">
          {profile.title} building generative AI platforms and secure, automated infrastructure.
        </p>
        <div className="button-row">
          <a className="button button--primary" href="#experience">
            See my work
          </a>
          <a className="button" href="#contact">
            Get in touch
          </a>
        </div>
      </div>
      <div className="hero__scene">
        {webgl ? (
          <Suspense fallback={<div className="hero__fallback" />}>
            <HeroScene animate={!reducedMotion} />
          </Suspense>
        ) : (
          <div className="hero__fallback" />
        )}
        {webgl && <p className="hero__hint">Tap the lamp</p>}
      </div>
    </section>
  )
}
