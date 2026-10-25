import { profile } from '../data/resume'
import { useActiveChapter } from '../scroll/scrollStore'

export function Intro() {
  const active = useActiveChapter() === 0
  return (
    <section id="intro" className="chapter chapter--intro" data-active={active} aria-labelledby="intro-title">
      <div className="intro">
        <p className="eyebrow">{profile.subtitle}</p>
        <h1 id="intro-title" className="intro__title" tabIndex={-1} data-chapter-heading>
          {profile.name}
        </h1>
        <p className="intro__lead">
          {profile.title} building generative AI platforms and secure, automated infrastructure.
        </p>
        <p className="intro__welcome">
          <span className="intro__welcome-dot" aria-hidden="true" />
          Welcome to my room. Everything that glows is clickable.
        </p>
      </div>
      <div className="explore-hint" aria-hidden="true">
        <span className="explore-hint__item">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.7L4 14.5a1.5 1.5 0 0 1 2.4-1.8L9 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Tap an object
        </span>
        <span className="explore-hint__divider" />
        <span className="explore-hint__item">
          <span className="explore-hint__mouse">
            <span className="explore-hint__wheel" />
          </span>
          Scroll to walk the room
        </span>
      </div>
    </section>
  )
}
