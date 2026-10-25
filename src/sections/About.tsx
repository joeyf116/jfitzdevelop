import { Section } from '../components/Section'
import { education, highlights, profile } from '../data/resume'

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Engineer, tech lead, problem solver">
      <p className="prose">{profile.summary}</p>
      <ul className="stats">
        {highlights.map((item) => (
          <li key={item.label} className="card stats__item">
            <span className="stats__value">{item.value}</span>
            <span className="stats__label">{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="muted">
        {education.credential}, {education.school} ({education.year}). U.S. Navy veteran.
      </p>
    </Section>
  )
}
