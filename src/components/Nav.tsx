import { useState } from 'react'
import { chapters, profile } from '../data/resume'
import { useActiveChapter } from '../scroll/scrollStore'

export function Nav() {
  const [open, setOpen] = useState(false)
  const active = useActiveChapter()
  const close = () => setOpen(false)

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="nav__brand" href="#intro" onClick={close}>
          {profile.shortName}
        </a>
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
        <nav id="nav-links" className="nav__links" data-open={open} aria-label="Primary">
          {chapters.slice(1).map((chapter, i) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-current={active === i + 1 ? 'location' : undefined}
              onClick={close}
            >
              {chapter.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
