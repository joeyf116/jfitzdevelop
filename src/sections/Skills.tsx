import { Section } from '../components/Section'
import { skills } from '../data/resume'

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="What I work with">
      <div className="grid">
        {skills.map((group) => (
          <article key={group.name} className="card">
            <h3 className="card__title">{group.name}</h3>
            <ul className="chips">
              {group.items.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  )
}
