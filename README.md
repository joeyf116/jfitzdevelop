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
- `src/sections/`: one component per chapter (Intro, About, Skills, Experience, Contact).
- `src/scroll/scrollStore.ts`: turns the page scroll into a fractional chapter index that drives the camera.
- `src/three/`: the full-screen 3D room, built from primitives (no model files) and lazy-loaded so text renders before three.js downloads.
  - `cameraStops.ts`: where the camera sits for each chapter, adjusted to fit any screen shape.
  - `Interactive.tsx` / `hotspots.ts`: objects that open a chapter when clicked (wall frame → About, bookshelf → Skills, monitor → Experience, phone → Contact).

The room stays fixed behind the page. Scrolling or clicking an object flies the camera to it while that chapter's panel slides over. Every chapter is also reachable from the nav and by keyboard. With `prefers-reduced-motion`, the camera cuts between stops and the scene only redraws on change. Without WebGL the chapters read on a soft gradient.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. In the repo settings, set **Pages → Source** to **GitHub Actions**.

The site is served from `/jfitzdevelop/`. For a custom domain, set `VITE_BASE=/` in the build step and add a `public/CNAME` file.
