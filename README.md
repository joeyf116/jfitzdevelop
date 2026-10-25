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
- `src/theme/`: design tokens (`tokens.css`) that every component reads, and the matching colors for the 3D scene (`palette.ts`). The site is dark only.
- `src/sections/`: one component per page section.
- `src/three/`: the interactive desk/room hero scene, built from primitives (no model files) and lazy-loaded so text renders before three.js downloads. The monitor types code, the room tilts toward the pointer, and the lamp toggles on click or tap.

With `prefers-reduced-motion`, the scene renders still and only redraws on change. Without WebGL it falls back to a soft gradient.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. In the repo settings, set **Pages → Source** to **GitHub Actions**.

The site is served from `/jfitzdevelop/`. For a custom domain, set `VITE_BASE=/` in the build step and add a `public/CNAME` file.
