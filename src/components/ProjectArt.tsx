import type { ProjectArt as Art } from '../data/resume'

// Cartoon thumbnails: flat colors, thick ink outlines. Drawn inline so they need no image files.
const INK = '#1b1b2f'
const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Southeast Scramble: a gold trophy with a black belt (red bar) draped across it. */
function Scramble() {
  return (
    <>
      <rect width="120" height="120" rx="18" fill="#d08b73" />
      <path d="M24 20l6 8M96 20l-6 8M60 10v8" stroke="#fff7e6" strokeWidth="4" strokeLinecap="round" />
      {/* trophy cup and handles */}
      <path d="M38 30h44v14a22 22 0 0 1-44 0z" fill="#e2c37a" {...line} />
      <path d="M38 36H28a10 10 0 0 0 12 16M82 36h10a10 10 0 0 1-12 16" fill="none" {...line} />
      <path d="M54 66h12v12H54z" fill="#e2c37a" {...line} />
      <rect x="40" y="78" width="40" height="12" rx="3" fill="#8a6a4a" {...line} />
      {/* black belt with the red rank bar, draped over the cup */}
      <path d="M30 50q30 16 60 0l4 9q-34 18-68 0z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="68" y="54" width="10" height="9" fill="#c23b32" transform="rotate(-18 73 58)" />
      <path d="M58 62l-6 34M62 62l8 32" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M50 92l-1 6M71 90l2 6" stroke="#c23b32" strokeWidth="5" strokeLinecap="round" />
    </>
  )
}

/** Fretboard Practice: a slice of fretboard with colored note dots and a pick. */
function Fretboard() {
  const strings = [34, 46, 58, 70, 82, 94]
  const frets = [30, 56, 82]
  return (
    <>
      <rect width="120" height="120" rx="18" fill="#8ea8ff" />
      <rect x="10" y="26" width="100" height="74" rx="6" fill="#8a4f2a" {...line} />
      {frets.map((x) => (
        <path key={x} d={`M${x} 28v70`} stroke="#c3cad8" strokeWidth="4" />
      ))}
      {strings.map((y, i) => (
        <path key={y} d={`M12 ${y}h96`} stroke="#fff7e6" strokeWidth={1.5 + i * 0.4} />
      ))}
      <circle cx="69" cy="62" r="5" fill="#fff7e6" opacity="0.6" />
      {/* notes colored by role: root, third, fifth */}
      <circle cx="43" cy="46" r="7" fill="#d84f4f" {...line} strokeWidth={3} />
      <circle cx="69" cy="70" r="7" fill="#6fd6c0" {...line} strokeWidth={3} />
      <circle cx="95" cy="58" r="7" fill="#e2c37a" {...line} strokeWidth={3} />
      <circle cx="43" cy="82" r="7" fill="#d84f4f" {...line} strokeWidth={3} />
      {/* guitar pick */}
      <path d="M86 6c14 0 22 6 18 16-3 8-10 14-14 18-4-4-11-10-14-18-4-10 3-16 10-16z" fill="#fff7e6" {...line} />
    </>
  )
}

const art = { scramble: Scramble, fretboard: Fretboard }

export function ProjectArt({ art: name }: { art: Art }) {
  const Drawing = art[name]
  return (
    <svg viewBox="0 0 120 120" className="project__art" aria-hidden="true">
      <Drawing />
    </svg>
  )
}
