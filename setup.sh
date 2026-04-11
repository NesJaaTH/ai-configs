#!/bin/bash
# วิธีใช้: ./setup.sh [ชื่อโปรเจค] [path โปรเจค]
# ตัวอย่าง: ./setup.sh miruway-api ~/code/miruway-api

PROJECT=$1
TARGET=$2
AI_CONFIGS_DIR=$(dirname "$0")

if [ -z "$PROJECT" ] || [ -z "$TARGET" ]; then
  echo "Usage: ./setup.sh [project-name] [target-path]"
  exit 1
fi

PROJECT_DIR="$AI_CONFIGS_DIR/projects/$PROJECT"
BASE_FILE="$AI_CONFIGS_DIR/base/claude.md"

if [ -d "$PROJECT_DIR" ]; then
  echo "📁 Found project folder: $PROJECT"

  # Copy CLAUDE.md
  if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
    cp "$PROJECT_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"
    echo "✅ Copied CLAUDE.md"
  else
    cp "$BASE_FILE" "$TARGET/CLAUDE.md"
    echo "✅ Copied base/claude.md (no project CLAUDE.md found)"
  fi

  # Copy hidden AI folders (.agent, .claude, .cursor, .gemini, .toh)
  for folder in .agent .claude .cursor .gemini .toh; do
    if [ -d "$PROJECT_DIR/$folder" ]; then
      cp -r "$PROJECT_DIR/$folder" "$TARGET/"
      echo "✅ Copied $folder/"
    fi
  done

else
  # ไม่มี project folder → ใช้ base
  echo "⚠️  No project folder found for '$PROJECT', using base template"
  cp "$BASE_FILE" "$TARGET/CLAUDE.md"
  echo "✅ Copied base/claude.md → $TARGET/CLAUDE.md"
fi

echo ""
echo "🎉 Done! AI configs ready at $TARGET"