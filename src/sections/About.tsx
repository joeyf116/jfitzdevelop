import { Chapter } from '../components/Chapter'
import { education, highlights, profile } from '../data/resume'

export function About() {
  return (
    <Chapter id="about" eyebrow="About" title="Engineer, tech lead, problem solver">
      <p className="prose">{profile.summary}</p>
      <ul className="stats">
        {highlights.map((item) => (
          <li key={item.label} className="stats__item">
            <span className="stats__value">{item.value}</span>
            <span className="stats__label">{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="muted small">
        {education.credential}, {education.school} ({education.year}). U.S. Navy veteran. Based in {profile.location}.
      </p>
    </Chapter>
  )
}
