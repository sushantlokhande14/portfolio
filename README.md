# sushant.dev — portfolio

Personal portfolio. Dark, technical, minimal. Built with [Astro](https://astro.build) + Tailwind CSS v4.

## Stack

- **Astro 5** — static, zero-JS by default, content collections
- **Tailwind CSS 4** — design tokens in `src/styles/global.css`
- **Inter + JetBrains Mono** — variable fonts via Fontsource
- GSAP + Lenis scroll animations — planned

## Updating content (no code required)

| What | Where |
| :-- | :-- |
| Add/edit a project | Drop a `.md` file in `src/content/projects/` — `featured: true` puts it on the homepage, each file gets its own page at `/projects/<filename>/` |
| Add/edit experience | Drop a `.md` file in `src/content/experience/` |
| Name, tagline, links, about, skills | Edit `src/data/site.json` |
| Résumé | Replace `public/resume.pdf` |

Frontmatter is validated by the schemas in `src/content.config.ts` — a typo fails the build instead of silently breaking the site.

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the production build |

## Build roadmap

- [x] Day 1 — scaffold, design tokens, full skeleton with placeholders
- [ ] Day 2–3 — typography & spacing refinement, nav polish
- [ ] Day 4–5 — hero animation detail
- [ ] Day 6–7 — real project content (2 case studies)
- [ ] Day 8–9 — project card & detail page polish
- [ ] Day 10 — experience timeline content
- [ ] Day 11 — skills & about content
- [ ] Day 12 — Lenis smooth scroll + GSAP scroll-triggered reveals
- [ ] Day 13 — responsive/mobile pass
- [ ] Day 14 — SEO, OG image, favicon, Lighthouse
