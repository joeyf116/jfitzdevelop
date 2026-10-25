import { Section } from '../components/Section'
import { profile } from '../data/resume'

export function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Let’s build something">
      <p className="prose">
        I’m always happy to talk about AI platforms, developer tooling, or a tough technical blocker.
      </p>
      <div className="button-row">
        <a className="button button--primary" href={`mailto:${profile.email}`}>
          Email me
        </a>
        <a className="button" href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="button" href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </Section>
  )
}
