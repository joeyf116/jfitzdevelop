import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/luckiest-guy/latin-400.css'
import '@fontsource/patrick-hand/latin-400.css'
import 'lenis/dist/lenis.css'
import App from './App'
import './theme/tokens.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
