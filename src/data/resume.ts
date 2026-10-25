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

export const education = {
  school: 'DigitalCrafts, Atlanta, GA',
  credential: 'Certificate in Software Engineering',
  year: '2019',
}

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const
