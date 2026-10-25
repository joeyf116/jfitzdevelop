import type { ReactNode } from 'react'
import { chapters, type ChapterId } from '../data/resume'
import { goToChapter, useActiveChapter } from '../scroll/scrollStore'

interface ChapterProps {
  id: ChapterId
  title: string
  eyebrow: string
  children: ReactNode
}

/** One scroll stop. The camera frames its object while the panel fades in over the scene. */
export function Chapter({ id, title, eyebrow, children }: ChapterProps) {
  const active = useActiveChapter() === chapters.findIndex((chapter) => chapter.id === id)
  return (
    <section id={id} className="chapter" data-active={active} aria-labelledby={`${id}-title`}>
      <div className="panel">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="panel__title" tabIndex={-1} data-chapter-heading>
          {title}
        </h2>
        {children}
        <button type="button" className="back-link" onClick={() => goToChapter('intro')}>
          <span aria-hidden="true">←</span> Back to the room
        </button>
      </div>
    </section>
  )
}
