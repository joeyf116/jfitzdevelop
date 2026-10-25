import { Chapter } from '../components/Chapter'
import { experience } from '../data/resume'

export function Experience() {
  return (
    <Chapter id="experience" eyebrow="Experience" title="Pinned to the board">
      <ol className="timeline">
        {experience.map((role) => (
          <li key={role.title} className="timeline__item">
            <h3 className="timeline__title">{role.title}</h3>
            <p className="muted small">
              {role.company} · {role.start} – {role.end}
              {role.focus && ` · ${role.focus}`}
            </p>
            <ul className="timeline__points">
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Chapter>
  )
}
