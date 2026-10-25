import { profile } from '../data/resume'
import { goToChapter } from '../scroll/scrollStore'

export function Intro() {
  return (
    <section id="intro" className="chapter chapter--intro" aria-labelledby="intro-title">
      <div className="intro">
        <p className="eyebrow">{profile.subtitle}</p>
        <h1 id="intro-title" className="intro__title" tabIndex={-1} data-chapter-heading>
          {profile.name}
        </h1>
        <p className="intro__lead">
          {profile.title} building generative AI platforms and secure, automated infrastructure.
        </p>
        <button type="button" className="button button--primary" onClick={() => goToChapter('about')}>
          Explore the desk
        </button>
      </div>
      <p className="scroll-hint" aria-hidden="true">
        Scroll, or tap anything in the room
      </p>
    </section>
  )
}
