import { useEffect } from 'react'
import { ChapterDots } from './components/ChapterDots'
import { Nav } from './components/Nav'
import { SceneBackdrop } from './components/SceneBackdrop'
import { profile } from './data/resume'
import { useMotionEnabled } from './motion/motionStore'
import { goToChapter, startScrollTracking } from './scroll/scrollStore'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hobbies } from './sections/Hobbies'
import { Intro } from './sections/Intro'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'

export default function App() {
  const motion = useMotionEnabled()

  useEffect(() => startScrollTracking(motion), [motion])

  // Escape zooms back out to the whole room.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') goToChapter('intro')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <SceneBackdrop />
      <Nav />
      <ChapterDots />
      <main id="main">
        <Intro />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Hobbies />
        <Contact />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </>
  )
}
