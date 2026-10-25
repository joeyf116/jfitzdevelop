import { useEffect } from 'react'
import { Nav } from './components/Nav'
import { SceneBackdrop } from './components/SceneBackdrop'
import { profile } from './data/resume'
import { startScrollTracking } from './scroll/scrollStore'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Intro } from './sections/Intro'
import { Skills } from './sections/Skills'

export default function App() {
  useEffect(startScrollTracking, [])

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <SceneBackdrop />
      <Nav />
      <main id="main">
        <Intro />
        <About />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </>
  )
}
