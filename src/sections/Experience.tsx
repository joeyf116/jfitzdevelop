import { Section } from '../components/Section'
import { experience } from '../data/resume'

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where I’ve made an impact">
      <ol className="timeline">
        {experience.map((role) => (
          <li key={role.title} className="timeline__item card">
            <header className="timeline__header">
              <h3 className="card__title">{role.title}</h3>
              <p className="muted">
                {role.company} · {role.start} – {role.end}
              </p>
              {role.focus && <p className="timeline__focus">{role.focus}</p>}
            </header>
            <ul className="timeline__points">
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
