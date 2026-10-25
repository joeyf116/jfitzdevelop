export type ThemeName = 'light' | 'dark'

// Colors the WebGL scene needs. Keep in sync with tokens.css.
export const sceneColors: Record<ThemeName, { primary: string; secondary: string; ambient: number }> = {
  dark: { primary: '#7c9cff', secondary: '#3ee6c1', ambient: 0.4 },
  light: { primary: '#3b5bdb', secondary: '#0f9f7f', ambient: 0.9 },
}
