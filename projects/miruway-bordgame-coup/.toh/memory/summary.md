# Project Summary

## Project
Coup board game - Next.js 14 web app

## Tech Stack
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + CSS custom properties (oklch design tokens)
- Fonts: Cormorant Garamond (display) + DM Sans (UI)
- State: Zustand
- Backend: Supabase (Realtime Broadcast for game state, DB for rooms)
- Language: TypeScript (strict)

## Design System
- Deep navy backgrounds: --bg-0 through --bg-3 (oklch 7%-19%)
- Amber gold accent: --gold (oklch 72% 0.14 82)
- Character colors in oklch: --duke, --assassin, --captain, --ambassador, --contessa
- Typography: Cormorant Garamond for dramatic headings, DM Sans for all UI text
- All components use CSS variables via inline styles (no hardcoded hex)

## Completed Features
- [x] Single-device vs AI game (local)
- [x] Game engine (actions, challenges, blocks, exchange)
- [x] AI controller (aggressive/cautious/random personalities)
- [x] Dark Editorial x Card Game Drama visual design
  - Cormorant Garamond + DM Sans typography
  - oklch color token system
  - Editorial bottom sheet dialogs
  - Card as visual hero with large character initial
  - Coin dot indicators
- [x] Online multiplayer via Supabase Realtime
  - Room creation with 6-char code
  - Player lobby with ready system
  - Host-authoritative game state broadcast
  - Per-client card visibility (own cards face-up, others face-down)

## Key Architecture
- Game engine is pure functions in src/lib/engine/
- Local game: useGameStore (Zustand) drives AI + human turns
- Multiplayer: useMultiplayerStore - host processes all moves, broadcasts state
- Player identity: persistent UUID in localStorage
- Game player IDs: "player-0", "player-1", ... mapped to seat_index
