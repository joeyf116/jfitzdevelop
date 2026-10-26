// Single source of truth for site content. Edit here, not in components.

export const profile = {
  name: 'Joseph Fitzpatrick',
  shortName: 'Joey Fitzpatrick',
  title: 'Senior Software Engineer',
  subtitle: 'Tech Lead, AI Engineering',
  location: 'Greenville, SC',
  email: 'jfitzdevelop@gmail.com',
  linkedin: 'https://www.linkedin.com/in/joseph-fitzpatrick',
  github: 'https://github.com/joeyf116',
  venmo: 'https://venmo.com/u/joey-fitzpatrick-2',
  summary:
    'Senior Software Engineer and Tech Lead with 6+ years of full-stack experience. I build generative AI tools: an internal GPT platform with 2,000+ monthly users, an AI Portal, and AI cost and adoption modeling. My primary stack is React, TypeScript, C#/.NET, Python, and Azure.',
}

export const highlights = [
  { value: '2,000+', label: 'monthly users on the GPT platform I built' },
  { value: '500+', label: 'hours of manual provisioning eliminated' },
  { value: '6+', label: 'years of full-stack engineering' },
]

export interface SkillGroup {
  name: string
  items: string[]
}

export const skills: SkillGroup[] = [
  {
    name: 'AI & LLMs',
    items: ['Generative AI', 'RAG', 'Embeddings & vector search', 'Prompt engineering', 'OpenAI / Azure OpenAI', 'Anthropic', 'Gemini', 'Grok'],
  },
  {
    name: 'Languages & Frameworks',
    items: ['TypeScript', 'React', 'Next.js', 'C# / .NET', 'Python', 'Node.js', 'PowerShell', 'REST APIs'],
  },
  {
    name: 'Cloud & DevOps',
    items: ['Azure', 'Azure Government', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'GitHub Actions', 'Azure DevOps'],
  },
  {
    name: 'Security & Identity',
    items: ['IAM', 'SSO', 'SAML', 'OIDC', 'Keycloak', 'ADFS', 'CAC auth', 'DISA STIG'],
  },
  { name: 'Data', items: ['PostgreSQL', 'SQL', 'MongoDB'] },
  {
    name: 'Practices',
    items: ['TDD', 'Jest / xUnit / pytest', 'System design', 'FinOps', 'Legacy modernization', 'Technical leadership', 'Agile / SAFe'],
  },
]

export interface Role {
  company: string
  title: string
  start: string
  end: string
  focus?: string
  points: string[]
}

export const experience: Role[] = [
  {
    company: 'SAIC',
    title: 'Senior Software Engineer, AI Engineering',
    start: '2025',
    end: 'Present',
    points: [
      'Built the company’s internal GPT platform, a RAG app on PostgreSQL with a custom Python text-extraction pipeline, serving 2,000 to 2,500 unique users each month.',
      'Created an AI Portal where employees discover AI tools and teams request new products or custom solutions.',
      'Delivered a FinOps dashboard of AI spend and adoption that drives the company’s AI cost modeling.',
      'As Tech Lead, design the team’s applications, own the backlog, and turn requirements into development work.',
      'Member of the “Ghostbusters” team that clears technical blockers across modernization, cloud migration, CI/CD, integrations, and IAM.',
      'Prototype and pilot new LLMs and AI tools, then roll out the successful ones company-wide.',
    ],
  },
  {
    company: 'SAIC',
    title: 'Senior Software Engineer, Infrastructure Automation',
    start: '2020',
    end: '2025',
    focus: 'Security hardening for SCIF environments',
    points: [
      'Developed a self-service React/.NET app that uses Terraform and Ansible to create, provision, harden, and inspect VMs on demand to DoD (DISA STIG) standards.',
      'Added configuration drift remediation so users can re-apply security baselines to out-of-compliance machines.',
      'Automated generation of STIG hardening scripts (PowerShell, DSC, Ansible) with each new benchmark release.',
      'Eliminated 500+ hours of manual provisioning and hardening work. Promoted to Senior in 2025.',
    ],
  },
  {
    company: 'United States Navy',
    title: 'Master-at-Arms (E-5)',
    start: '2013',
    end: '2017',
    points: [
      'Managed training for patrol section personnel and oversaw quarterly Anti-Terrorism Force Protection evaluations at two naval installations in Sicily, Italy.',
    ],
  },
]

export type ProjectArt = 'scramble' | 'fretboard'

export interface Project {
  title: string
  tagline: string
  description: string
  tags: string[]
  art: ProjectArt
  demoUrl?: string
  sourceUrl?: string
}

export const projects: Project[] = [
  {
    title: 'Southeast Scramble',
    tagline: 'Sub only. EBI rules. Cash prize.',
    description:
      'The website for the Southeast Scramble, a no-gi, submission-only jiu-jitsu tournament run on EBI overtime rules. Athletes apply, read the ruleset, and sponsors get in touch.',
    tags: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    art: 'scramble',
    demoUrl: 'https://joeyf116.github.io/southeastscramble/',
    sourceUrl: 'https://github.com/joeyf116/southeastscramble',
  },
  {
    title: 'Fretboard Practice',
    tagline: 'Scales, chords & inversions',
    description:
      'A guitar practice app built around an interactive 22-fret fretboard. Pick a key to see scales by position, chord voicings up the neck, and inversions, with tab you can step through and play back.',
    tags: ['React', 'Vite', 'Vitest', 'Music theory'],
    art: 'fretboard',
    demoUrl: 'https://joeyf116.github.io/music/',
    sourceUrl: 'https://github.com/joeyf116/music',
  },
]

// Off-the-clock things in the room. Edit the copy freely; the 3D objects don't depend on it.
export const hobbies = [
  {
    name: 'Guitar',
    emoji: '🎸',
    description: 'Twenty-ish years of playing and I still can’t walk past a guitar without picking it up. The Taylor 214ce by the window is my favorite way to dodge a bug I don’t want to fix yet.',
  },
  {
    name: 'Brazilian Jiu-Jitsu',
    emoji: '🥋',
    description: '10th Planet black belt, which mostly means I’m very good at politely asking people to tap. Still the best stress relief I’ve found, even if it involves a lot of getting squished.',
  },
  {
    name: 'Goose',
    emoji: '🐕',
    description: 'A European village dog I adopted while stationed in Italy. Chief Napping Officer, professional bed hog, and the real boss of this room.',
  },
]

export const education = {
  school: 'DigitalCrafts, Atlanta, GA',
  credential: 'Certificate in Software Engineering',
  year: '2019',
}

// Page chapters in scroll order. Each one has a matching camera stop in src/three/cameraStops.ts.
export const chapters = [
  { id: 'intro', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'contact', label: 'Contact' },
] as const

export type ChapterId = (typeof chapters)[number]['id']
