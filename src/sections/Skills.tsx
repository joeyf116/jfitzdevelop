import { Chapter } from '../components/Chapter'
import { skills } from '../data/resume'

export function Skills() {
  return (
    <Chapter id="skills" eyebrow="Skills" title="What’s on the shelf">
      <div className="skill-groups">
        {skills.map((group) => (
          <div key={group.name}>
            <h3 className="skill-groups__name">{group.name}</h3>
            <ul className="chips">
              {group.items.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Chapter>
  )
}
