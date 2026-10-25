import { useState, type MouseEvent } from 'react'
import { chapters, profile, type ChapterId } from '../data/resume'
import { setMotionEnabled, useMotionEnabled } from '../motion/motionStore'
import { goToChapter, useActiveChapter } from '../scroll/scrollStore'

export function Nav() {
  const [open, setOpen] = useState(false)
  const active = useActiveChapter()
  const motion = useMotionEnabled()

  // Links keep real hrefs for no-JS and "open in new tab", but fly the camera when clicked.
  const go = (id: ChapterId) => (event: MouseEvent) => {
    event.preventDefault()
    setOpen(false)
    goToChapter(id)
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="nav__brand" href="#intro" onClick={go('intro')}>
          {profile.shortName}
        </a>
        <div className="nav__actions">
          <button
            type="button"
            className="motion-toggle"
            aria-pressed={motion}
            onClick={() => setMotionEnabled(!motion)}
            title="Camera moves, smooth scrolling, and ambient effects"
          >
            Motion {motion ? 'on' : 'off'}
          </button>
          <button
            type="button"
            className="icon-button nav__menu-button"
            aria-expanded={open}
            aria-controls="nav-links"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 8h16M4 16h16'}
              />
            </svg>
          </button>
        </div>
        <nav id="nav-links" className="nav__links" data-open={open} aria-label="Primary">
          {chapters.slice(1).map((chapter, i) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-current={active === i + 1 ? 'location' : undefined}
              onClick={go(chapter.id)}
            >
              {chapter.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
