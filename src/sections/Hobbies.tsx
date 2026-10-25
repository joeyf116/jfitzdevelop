import { Chapter } from '../components/Chapter'
import { hobbies } from '../data/resume'

export function Hobbies() {
  return (
    <Chapter id="hobbies" eyebrow="Hobbies" title="Off the clock">
      <ul className="hobbies">
        {hobbies.map((hobby) => (
          <li key={hobby.name} className="hobby">
            <span className="hobby__emoji" aria-hidden="true">
              {hobby.emoji}
            </span>
            <div>
              <h3 className="hobby__name">{hobby.name}</h3>
              <p className="hobby__description">{hobby.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Chapter>
  )
}
