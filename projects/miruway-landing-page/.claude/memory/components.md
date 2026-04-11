# 📦 Component Registry

## 📄 Pages
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page — LightRays + all redesign sections |
| `/login` | `app/(auth)/login/page.tsx` | Sign in — LightRays + LoginForm |
| `/signup` | `app/(auth)/signup/page.tsx` | Sign up — LightRays + SignupForm |
| `/help` | `app/help/page.tsx` | Help page |

## 🧩 Components

### Redesign Sections
| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| NavbarRedesign | `components/redesign/navbar.tsx` | — | `app/page.tsx`, auth layout |
| HeroRedesign | `components/redesign/hero.tsx` | — | `app/page.tsx` |
| AboutRedesign | `components/redesign/about.tsx` | — | `app/page.tsx` |
| WorkRedesign | `components/redesign/work.tsx` | — | `app/page.tsx` |
| ContactRedesign | `components/redesign/contact.tsx` | — | `app/page.tsx` |
| FooterRedesign | `components/redesign/footer.tsx` | — | `app/page.tsx` |
| LogoMarquee | `components/redesign/logo-marquee.tsx` | — | `app/page.tsx` |
| CurvedDivider | `components/redesign/curved-divider.tsx` | — | `app/page.tsx` |

### React-bits / WebGL
| Component | Location | Key Props |
|-----------|----------|-----------|
| LightRays | `components/LightRays.jsx` | raysColor, raysOrigin, followMouse, pulsating |
| LogoLoop | `components/LogoLoop.jsx` | items, speed, direction |
| CurvedLoop | `components/CurvedLoop.jsx` | marqueeText, speed, curveAmount |
| CountUp | `components/CountUp.jsx` | to, duration |

### Auth Forms
| Component | Location | Description |
|-----------|----------|-------------|
| LoginForm | `components/login-form.tsx` | Centered sign-in, underline inputs, OAuth |
| SignupForm | `components/signup-form.tsx` | Centered sign-up, 4 fields, OAuth |

## 🛠️ Utilities
| Function | Location | Purpose |
|----------|----------|---------|
| cn | `lib/utils.ts` | Merge Tailwind classes |
| scrollToSection | `lib/scrollToSection.ts` | Smooth scroll by ID |

## 📊 Component Statistics
| Category | Count |
|----------|-------|
| Pages | 4 |
| Redesign sections | 8 |
| React-bits components | 4 |
| Auth forms | 2 |
| Hooks | 0 |
| Stores | 0 |

---
*Last updated: 2026-03-18*
