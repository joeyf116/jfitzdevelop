import { chapters } from '../data/resume'
import { goToChapter, useActiveChapter } from '../scroll/scrollStore'

/** A small progress rail on the right edge: where you are, and a shortcut to anywhere. */
export function ChapterDots() {
  const active = useActiveChapter()
  return (
    <nav className="dots" aria-label="Chapters">
      {chapters.map((chapter, i) => (
        <button
          key={chapter.id}
          type="button"
          className="dots__dot"
          aria-label={chapter.label}
          aria-current={active === i ? 'step' : undefined}
          onClick={() => goToChapter(chapter.id)}
        >
          <span className="dots__label" aria-hidden="true">
            {chapter.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
