# Active Task

## Current Focus
Character rename completed in code — all English names replaced with Thai

## Just Completed
- Renamed CharacterName type: Duke→เจ้าพยา, Assassin→นักฆ่า, Captain→จอมโจร, Ambassador→ทูต, Contessa→รัชทายาท
- Added `exchangeHandCardIds?: string[]` to GameState interface
- Updated constants.ts: all Record keys now Thai
- Updated game-engine.ts: log strings + replaced startExchange/completeExchange with new 2-param signature
- Updated ai-controller.ts: Thai names, new decideExchange with offeredHandCardId logic
- Updated game-store.ts: humanCompleteExchange now (keptCardId, offeredHandCardId)
- Updated multiplayer-store.ts: GameMove.offeredHandCardId added, exchange_complete handler updated
- Replaced exchange-dialog.tsx with 2-step UI (offer hand card → keep from pool)
- Updated game-board.tsx + multiplayer-game-board.tsx: new ExchangeDialog props
- Updated page.tsx + rules/page.tsx: Thai character arrays
- Updated card.tsx + challenge-dialog.tsx: Thai keys in CHAR_INITIAL/CHAR_COLOR maps
- Build passes with zero TypeScript errors

## Next Steps
- Test ทูต exchange flow in browser (both singleplayer and multiplayer)
- Test full multiplayer round on mobile

---
*Last updated: 2026-03-21*
