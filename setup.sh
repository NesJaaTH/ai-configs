#!/bin/bash
# วิธีใช้: ./setup.sh [ชื่อโปรเจค] [path โปรเจค]
# ตัวอย่าง: ./setup.sh miruway-api D:/git/Miruway/miruway-api
#
# ⚠️  Windows path: ใช้ forward slash เสมอ (D:/git/... ไม่ใช่ D:\git\...)
#     backslash จะถูก bash กินก่อน script ได้รับ argument

PROJECT=$1
AI_CONFIGS_DIR=$(dirname "$0")

if [ -z "$PROJECT" ] || [ -z "$2" ]; then
  echo "Usage: ./setup.sh [project-name] [target-path]"
  echo ""
  echo "Example (Windows): ./setup.sh miruway-api D:/git/Miruway/miruway-api"
  echo "Example (Unix):    ./setup.sh miruway-api ~/code/miruway-api"
  exit 1
fi

# Normalize: backslash → forward slash (ช่วยได้เมื่อ path ถูก quoted)
TARGET=$(echo "$2" | tr '\\' '/')

# Detect broken Windows path — backslash ถูก shell กินแล้ว เช่น D:gitMiruway
if [[ "$TARGET" =~ ^[A-Za-z]:[^/] ]]; then
  echo "❌ Path looks broken: $TARGET"
  echo "   Backslashes were eaten by bash before the script received them."
  echo "   Use forward slashes instead:"
  echo "   ./setup.sh $PROJECT $(echo "$TARGET" | sed 's|^[A-Za-z]:|&/|')"
  exit 1
fi

# Validate target directory exists
if [ ! -d "$TARGET" ]; then
  echo "❌ Target directory does not exist: $TARGET"
  exit 1
fi

PROJECT_DIR="$AI_CONFIGS_DIR/projects/$PROJECT"
BASE_DIR="$AI_CONFIGS_DIR/base"

if [ -d "$PROJECT_DIR" ]; then
  echo "📁 Found project folder: $PROJECT"

  # Copy CLAUDE.md
  if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
    cp "$PROJECT_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"
    echo "✅ Copied CLAUDE.md (project-specific)"
  else
    cp "$BASE_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"
    echo "✅ Copied CLAUDE.md (base template)"
  fi

  # Copy hidden AI folders (.agent, .claude, .cursor, .gemini, .toh)
  for folder in .agent .claude .cursor .gemini .toh; do
    if [ -d "$PROJECT_DIR/$folder" ]; then
      cp -r "$PROJECT_DIR/$folder" "$TARGET/"
      echo "✅ Copied $folder/"
    fi
  done

  # Merge base .claude/commands/ into project (don't overwrite existing)
  if [ -d "$BASE_DIR/.claude/commands" ]; then
    mkdir -p "$TARGET/.claude/commands"
    for cmd in "$BASE_DIR/.claude/commands/"*; do
      fname=$(basename "$cmd")
      if [ ! -f "$TARGET/.claude/commands/$fname" ]; then
        cp "$cmd" "$TARGET/.claude/commands/$fname"
        echo "✅ Copied .claude/commands/$fname"
      else
        echo "⏭️  .claude/commands/$fname already exists — skipped"
      fi
    done
  fi

else
  # ไม่มี project folder → ใช้ base
  echo "⚠️  No project folder found for '$PROJECT', using base template"
  cp "$BASE_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"
  echo "✅ Copied CLAUDE.md (base template)"

  # Copy base .claude/commands/
  if [ -d "$BASE_DIR/.claude/commands" ]; then
    mkdir -p "$TARGET/.claude/commands"
    cp "$BASE_DIR/.claude/commands/"* "$TARGET/.claude/commands/"
    echo "✅ Copied .claude/commands/"
  fi
fi

# ─── Hotcache ─────────────────────────────────────────────────────
echo ""
echo "⚡ Setting up Hotcache..."

if [ -f "$TARGET/hotcache.md" ]; then
  echo "⏭️  hotcache.md already exists — skipped"
else
  cp "$BASE_DIR/hotcache.md" "$TARGET/hotcache.md"
  echo "✅ Copied hotcache.md"
fi

# ─── Memory System ────────────────────────────────────────────────
echo ""
echo "🧠 Setting up Memory System..."

# Copy MEMORY-SYSTEM.md and MEMORY-INSTRUCTIONS.md
cp "$BASE_DIR/MEMORY-SYSTEM.md" "$TARGET/MEMORY-SYSTEM.md"
echo "✅ Copied MEMORY-SYSTEM.md"

cp "$BASE_DIR/MEMORY-INSTRUCTIONS.md" "$TARGET/MEMORY-INSTRUCTIONS.md"
echo "✅ Copied MEMORY-INSTRUCTIONS.md"

# Create memory/ folder with templates (skip if already exists)
if [ -d "$TARGET/memory" ]; then
  echo "⏭️  memory/ already exists — skipped"
else
  mkdir -p "$TARGET/memory/archive"
  cp "$BASE_DIR/memory/active.md"    "$TARGET/memory/active.md"
  cp "$BASE_DIR/memory/summary.md"   "$TARGET/memory/summary.md"
  cp "$BASE_DIR/memory/decisions.md" "$TARGET/memory/decisions.md"
  echo "✅ Created memory/ (active.md, summary.md, decisions.md)"
fi
# ──────────────────────────────────────────────────────────────────

echo ""
echo "🎉 Done! AI configs ready at $TARGET"
