import type { ProjectArt as Art } from '../data/resume'

// Cartoon thumbnails: flat colors, thick ink outlines. Drawn inline so they need no image files.
const INK = '#1b1b2f'
const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Robot() {
  return (
    <>
      <rect width="120" height="120" rx="18" fill="#8ea8ff" />
      <path d="M14 30h40a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H30l-10 9v-9h-6a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z" fill="#fff7e6" {...line} />
      <path d="M22 44h24" {...line} />
      <line x1="84" y1="30" x2="84" y2="44" {...line} />
      <circle cx="84" cy="27" r="5" fill="#f0b67f" {...line} />
      <rect x="62" y="44" width="44" height="38" rx="10" fill="#6fd6c0" {...line} />
      <circle cx="76" cy="62" r="5" fill={INK} />
      <circle cx="92" cy="62" r="5" fill={INK} />
      <path d="M76 73q8 6 16 0" fill="none" {...line} />
      <rect x="68" y="82" width="32" height="24" rx="6" fill="#c3cad8" {...line} />
      <circle cx="84" cy="94" r="4" fill="#d08b73" {...line} />
    </>
  )
}

function Detective() {
  return (
    <>
      <rect width="120" height="120" rx="18" fill="#6fd6c0" />
      <rect x="16" y="26" width="46" height="70" rx="8" fill="#c3cad8" {...line} />
      <path d="M24 42h30M24 58h30M24 74h30" {...line} />
      <circle cx="54" cy="42" r="3" fill="#d08b73" />
      <circle cx="78" cy="58" r="22" fill="#fff7e6" {...line} />
      <circle cx="78" cy="58" r="14" fill="#8ea8ff" opacity="0.5" />
      <path d="M94 74l16 16" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M70 52q4-6 10-4" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M68 64l6 6 12-14" fill="none" stroke="#d08b73" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function Piggy() {
  return (
    <>
      <rect width="120" height="120" rx="18" fill="#f0b67f" />
      <path d="M22 96V78M38 96V66M54 96V72" stroke="#fff7e6" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="74" cy="66" rx="32" ry="26" fill="#f6a5b8" {...line} />
      <path d="M58 44l-4-12 14 8" fill="#f6a5b8" {...line} />
      <ellipse cx="102" cy="66" rx="8" ry="10" fill="#f29ab0" {...line} />
      <circle cx="100" cy="63" r="1.8" fill={INK} />
      <circle cx="100" cy="69" r="1.8" fill={INK} />
      <circle cx="86" cy="56" r="4" fill={INK} />
      <path d="M62 40h18" {...line} />
      <path d="M58 90v8M88 90v8" {...line} />
      <circle cx="71" cy="26" r="10" fill="#e2c37a" {...line} />
      <path d="M71 21v10" {...line} />
    </>
  )
}

const art = { robot: Robot, detective: Detective, piggy: Piggy }

export function ProjectArt({ art: name }: { art: Art }) {
  const Drawing = art[name]
  return (
    <svg viewBox="0 0 120 120" className="project__art" aria-hidden="true">
      <Drawing />
    </svg>
  )
}
