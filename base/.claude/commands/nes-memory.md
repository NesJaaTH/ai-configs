Execute the memory command: $ARGUMENTS

Follow these rules based on the argument:

---

## If argument is empty (just `/nes-memory`)
**Show current memory status.**

Read these 3 files in parallel:
- `memory/active.md`
- `memory/summary.md`
- `memory/decisions.md`

Then display a status summary in this format:
```
📚 Memory Status
━━━━━━━━━━━━━━━━━━━━
🔥 Current Focus: [from active.md]
📋 Project: [from summary.md]
✅ Completed: [total completed features from summary.md]
📝 Last decisions: [last 2 rows from decisions.md]
⏳ Next Steps: [from active.md]
━━━━━━━━━━━━━━━━━━━━
Last updated: [timestamp from active.md]
```

---

## If argument is `save`
**Force save all memory files.**

Read the current conversation context and update all 3 files:
1. Update `memory/active.md` — reflect what was just done, update Next Steps
2. Update `memory/decisions.md` — add any new decisions made this session
3. Update `memory/summary.md` — add any completed features/milestones

Auto-archive if `active.md` has more than 50 lines or 10 completed items:
- Move old completed items to `memory/archive/YYYY-MM-DD.md`
- Keep active.md lean (Current Focus + last 3 In Progress + Next Steps)

Confirm with: "✅ Memory saved — all 3 files updated"

---

## If argument is `load`
**Force reload all memory files.**

Read these 3 files in parallel:
- `memory/active.md`
- `memory/summary.md`
- `memory/decisions.md`

Then acknowledge with a brief summary:
```
📚 Memory reloaded!
Project: [project name]
Last done: [last completed task]
Next up: [next step]
```

---

## If argument is `clear`
**Archive current memory and reset to blank.**

1. Read `memory/active.md` and `memory/summary.md`
2. Create `memory/archive/YYYY-MM-DD.md` with full content of both files
3. Reset `memory/active.md` to blank template:
```markdown
# 🔥 Active Task

## Current Focus
[Waiting for user]

## In Progress
- (none)

## Next Steps
- Waiting for user instructions

---
*Last updated: YYYY-MM-DD*
```
4. Keep `memory/summary.md` and `memory/decisions.md` intact (don't clear project history)
5. Confirm with: "🗂️ Memory cleared — archived to memory/archive/YYYY-MM-DD.md"
