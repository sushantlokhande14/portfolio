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
- [x] Day 2 — light/dark theme system with toggle, Apple-style visual pass
- [x] Day 3 — glass UI (frosted cards, ambient backdrop), real content: 7 projects,
      3 experience entries, education + research section, all-projects page
- [ ] Hero animation detail pass
- [ ] Project detail page polish (images/diagrams per case study)
- [ ] Lenis smooth scroll + GSAP scroll-triggered reveals
- [ ] Responsive/mobile pass
- [ ] SEO, OG image, favicon, Lighthouse
- [ ] resume.pdf in public/ (résumé button 404s until then)
