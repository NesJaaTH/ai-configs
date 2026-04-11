# Key Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-19 | Supabase Realtime Broadcast (not DB changes) for game state | Lower latency, simpler for turn-based game |
| 2026-03-19 | Host-authoritative architecture | Only host runs game engine, prevents state divergence |
| 2026-03-19 | Lazy Supabase client singleton | Avoids Next.js static prerender errors with placeholder env vars |
| 2026-03-19 | Player identity via localStorage UUID | Stateless, no auth required for quick multiplayer |
| 2026-03-19 | Game player IDs as "player-{seat_index}" | Direct mapping between room seat and game player |
| 2026-03-19 | RLS "Allow all" policies on rooms/room_players | Permissive for game use; can tighten later |
| 2026-03-19 | passChallenge auto-triggers resolveAction when all passed | Reduces round trips in multiplayer |
