import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  title: string
  eyebrow?: string
  children: ReactNode
}

export function Section({ id, title, eyebrow, children }: SectionProps) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="section__title">
        {title}
      </h2>
      {children}
    </section>
  )
}
