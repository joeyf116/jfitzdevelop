# jfitzdevelop

Joseph Fitzpatrick's interactive 3D portfolio, built with React, Vite, TypeScript, and react-three-fiber.

Live site: https://joeyf116.github.io/jfitzdevelop/

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/jfitzdevelop/
npm run lint
npm run build    # outputs to dist/
```

## Structure

- `src/data/resume.ts`: all site content. Edit text here, not in components.
- `src/theme/`: design tokens (`tokens.css`), `ThemeProvider` and `useTheme` for the light/dark theme, and the colors the 3D scene uses (`themes.ts`).
- `src/sections/`: one component per page section.
- `src/three/`: the 3D hero scene, lazy-loaded so text renders before three.js downloads.

The scene respects `prefers-reduced-motion` and falls back to a gradient when WebGL is unavailable.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. In the repo settings, set **Pages → Source** to **GitHub Actions**.

The site is served from `/jfitzdevelop/`. For a custom domain, set `VITE_BASE=/` in the build step and add a `public/CNAME` file.
