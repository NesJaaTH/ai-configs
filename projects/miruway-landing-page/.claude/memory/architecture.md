# 🏗️ Project Architecture

## 📁 Entry Points

| Type | Path | Purpose |
|------|------|---------|
| Main | `app/page.tsx` | Landing page (LightRays + all sections) |
| Layout | `app/layout.tsx` | Root layout — Sora + DM Sans fonts |
| Auth Layout | `app/(auth)/layout.tsx` | Auth pages — NavbarRedesign only |
| Login | `app/(auth)/login/page.tsx` | LightRays + LoginForm |
| Signup | `app/(auth)/signup/page.tsx` | LightRays + SignupForm |
| API | `app/api/health/` | Health check endpoint |

---

## 🗂️ Core Modules

### `/app` - Pages & Routes
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Full landing page with WebGL background |
| `/login` | `app/(auth)/login/page.tsx` | Sign in page |
| `/signup` | `app/(auth)/signup/page.tsx` | Create account page |
| `/help` | `app/help/` | Help page |

### `/components/redesign` - Landing Page Sections
| Component | Purpose |
|-----------|---------|
| `navbar.tsx` | Fixed nav, scroll-aware, Sign in / Sign up |
| `hero.tsx` | GSAP typewriter, display headline |
| `about.tsx` | Two-column stats + capabilities, CountUp |
| `work.tsx` | Project list rows with hover effects |
| `contact.tsx` | Two-column form + statement |
| `footer.tsx` | Minimal footer |
| `logo-marquee.tsx` | Two-row LogoLoop tech marquee |
| `curved-divider.tsx` | CurvedLoop SVG text divider |

### `/components` - Shared / React-bits
| Component | Purpose |
|-----------|---------|
| `LightRays.jsx` | OGL WebGL shader background |
| `LogoLoop.jsx` | Bidirectional logo marquee |
| `CurvedLoop.jsx` | Curved SVG text marquee |
| `CountUp.jsx` | Spring-physics animated counter |
| `login-form.tsx` | Sign in form (centered, underline inputs) |
| `signup-form.tsx` | Sign up form (centered, underline inputs) |

### `/lib` - Utilities
| File | Purpose |
|------|---------|
| `lib/utils.ts` | cn() class merge |
| `lib/scrollToSection.ts` | Smooth scroll to section by ID |
| `lib/api/auth/signup-server.ts` | OAuth provider action |

---

## 🎨 Design System
- Background: `oklch(11% 0.025 290)` deep violet
- Primary: `#A855F7` (purple)
- Accent: `#EC4899` (pink)
- Gradient: `135deg, #A855F7 → #EC4899`
- Fonts: Sora (heading) + DM Sans (body)
- Easing: `[0.25, 1, 0.5, 1]` ease-out-quart

## 🔄 Data Flow Pattern
User → Component → API Action → Supabase

## 🔌 External Services
| Service | Purpose | Config |
|---------|---------|--------|
| Supabase | Auth (OAuth) | `lib/api/auth/` |

---
*Last updated: 2026-03-18*
