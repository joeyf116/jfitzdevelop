import { Chapter } from '../components/Chapter'
import { ProjectArt } from '../components/ProjectArt'
import { projects } from '../data/resume'

export function Projects() {
  return (
    <Chapter id="projects" eyebrow="Projects" title="On the screen right now" variant="cartoon">
      <ul className="projects">
        {projects.map((project) => (
          <li key={project.title} className="project">
            <ProjectArt art={project.art} />
            <div className="project__body">
              <h3 className="project__title">
                {project.title}
                {project.mock && <span className="project__badge">demo</span>}
              </h3>
              <p className="project__tagline">{project.tagline}</p>
              <p className="project__description">{project.description}</p>
              <ul className="project__tags">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              {(project.demoUrl || project.sourceUrl) && (
                <p className="project__links">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      Live demo
                    </a>
                  )}
                  {project.sourceUrl && (
                    <a href={project.sourceUrl} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  )}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Chapter>
  )
}
