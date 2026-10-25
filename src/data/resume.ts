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

export type ProjectArt = 'robot' | 'detective' | 'piggy'

export interface Project {
  title: string
  tagline: string
  description: string
  tags: string[]
  art: ProjectArt
  demoUrl?: string
  sourceUrl?: string
  /** Placeholder project shown until real ones are added. */
  mock?: boolean
}

// Mock projects for now. Replace with real ones (and add demoUrl/sourceUrl) when ready.
export const projects: Project[] = [
  {
    title: 'Prompt Pal',
    tagline: 'One prompt, every model',
    description: 'Send the same prompt to OpenAI, Anthropic, Gemini, and Grok side by side, then compare answers, speed, and cost.',
    tags: ['React', 'TypeScript', 'LLMs'],
    art: 'robot',
    mock: true,
  },
  {
    title: 'Drift Detective',
    tagline: 'Sniffs out config drift',
    description: 'A CLI that compares servers against their security baseline and opens a fix-it pull request when something wanders off.',
    tags: ['Python', 'Ansible', 'CLI'],
    art: 'detective',
    mock: true,
  },
  {
    title: 'Token Piggy',
    tagline: 'Know what your AI costs',
    description: 'A tiny dashboard that tracks LLM spend per team and nudges you before the budget runs dry.',
    tags: ['Next.js', 'PostgreSQL', 'FinOps'],
    art: 'piggy',
    mock: true,
  },
]

// Off-the-clock things in the room. Edit the copy freely; the 3D objects don't depend on it.
export const hobbies = [
  {
    name: 'Guitar',
    emoji: '🎸',
    description: 'The acoustic by the plant gets picked up whenever I need to step away from a screen.',
  },
  {
    name: 'Goose',
    emoji: '🐕',
    description: 'My dog and official office mate. Long legs, big grin, and strong opinions about walk time.',
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
