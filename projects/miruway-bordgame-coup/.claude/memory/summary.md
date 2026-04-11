# 📋 Project Summary

## Project: Coup Board Game (Online Multiplayer)
**Status:** Online-only, build passing, deployed to GitHub

## Tech Stack
- Next.js 14 (App Router), TypeScript strict, Tailwind CSS
- shadcn/ui, Zustand, Framer Motion, Lucide React
- Supabase Realtime (Broadcast + Postgres Changes)
- Bun runtime

## Repo Structure (root level)
```
src/app/          → pages: /, /game, /lobby, /lobby/[code], /rules
src/components/   → game/ + ui/ (shadcn)
src/lib/engine/   → game state machine (pure TypeScript)
src/lib/ai/       → AI controller (kept but unused in online mode)
src/stores/       → game-store, multiplayer-store, ui-store
supabase/         → schema.sql (rooms + room_players + RLS)
```

## Character Names (README only — code not yet updated)
| Code Name | Display Name |
|-----------|-------------|
| Duke | เจ้าพยา |
| Assassin | นักฆ่า |
| Captain | จอมโจร |
| Ambassador | ทูต |
| Contessa | รัชทายาท |

## ทูต Ability (custom)
เลือก 1 ใบในมือ + จั่วจากกอง 2 ใบ → รวม 3 ใบ → เก็บ 1 ใบ → คืนที่เหลือเข้ากอง

## Completed Features
- Full Coup rules: Income, Foreign Aid, Coup, Tax, Assassinate, Steal, Exchange
- Challenge/block/counter-challenge chains (unified ChallengeDialog)
- Online multiplayer: host-authoritative via Supabase Realtime Broadcast
- Lobby: create room, join by code, ready-up, start game
- Mobile-first dark editorial UI: Cormorant Garamond + DM Sans, OKLCH colors
- Thai language UI throughout
- README with full Thai use case flows (UC-1 to UC-4.4)

## Removed
- Play with AI mode (/setup page deleted)

---
*Last updated: 2026-03-20*
