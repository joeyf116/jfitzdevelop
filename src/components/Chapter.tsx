import type { ReactNode } from 'react'
import type { ChapterId } from '../data/resume'

interface ChapterProps {
  id: ChapterId
  title: string
  eyebrow: string
  children: ReactNode
}

/** One scroll stop. The camera flies to its object while the panel slides over the scene. */
export function Chapter({ id, title, eyebrow, children }: ChapterProps) {
  return (
    <section id={id} className="chapter" aria-labelledby={`${id}-title`}>
      <div className="panel">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="panel__title" tabIndex={-1} data-chapter-heading>
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}
