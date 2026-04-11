# 📋 Project Summary

## Project Overview
- Name: Miruway Landing Page
- Type: Portfolio / Agency landing page
- Tech Stack: Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion, GSAP, OGL (WebGL), TypeScript, Bun
- Branch: `redesign/landing-page-overhaul`
- Repo: https://github.com/Miruway-Official/Miruway-Landing-Page

## Completed Features
- LightRays WebGL background (OGL shaders, pulsating, mouse-follow) — homepage + auth pages
- GSAP typewriter hero animation cycling through brand words
- LogoLoop bidirectional tech marquee (two rows, hover pause)
- CurvedLoop SVG text divider between Work and Contact sections
- CountUp spring-animated stats in About section
- NavbarRedesign with Sign in | Sign up links
- Full redesign: Hero, About, Work, Contact, Footer sections
- Auth pages (/login, /signup) — single-column centered, no panels, WebGL background
- OKLCH color system: background oklch(11% 0.025 290), primary #A855F7, accent #EC4899
- Sora (headings) + DM Sans (body) typography
- README with stack, features, design system docs

## Current State
Redesign complete. All changes committed and pushed. PRs #2 and #3 open on GitHub.

## Important Notes
- Use `bun` runtime for all commands (not npm/npx)
- impeccable plugin used for design direction (no glassmorphism, OKLCH colors, editorial layout)
- Auth pages share exact same LightRays props as homepage
- `bg-background` divider span in auth forms masks the horizontal rule

---
*Last updated: 2026-03-18*
