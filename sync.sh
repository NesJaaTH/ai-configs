#!/bin/bash
# วิธีใช้:
#   sync ทุกโปรเจค  : ./sync.sh
#   sync โปรเจคเดียว: ./sync.sh miruway-api

AI_CONFIGS_DIR=$(dirname "$0")
CONF_FILE="$AI_CONFIGS_DIR/projects.conf"
SPECIFIC_PROJECT=$1

if [ ! -f "$CONF_FILE" ]; then
  echo "❌ Not found: $CONF_FILE"
  exit 1
fi

# ตรวจสอบ environment (macOS / Git Bash / WSL / Linux)
detect_env() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macos"
  elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
    echo "gitbash"
  elif grep -qi microsoft /proc/version 2>/dev/null; then
    echo "wsl"
  else
    echo "linux"
  fi
}

ENV=$(detect_env)

# แปลง Windows path → Unix path ตาม environment
normalize_path() {
  local path="$1"

  path="${path//\\//}"

  if [[ "$path" =~ ^([a-zA-Z]):/(.*)$ ]]; then
    local drive="${BASH_REMATCH[1],}"
    local rest="${BASH_REMATCH[2]}"
    if [[ "$ENV" == "wsl" ]]; then
      path="/mnt/$drive/$rest"
    else
      path="/$drive/$rest"
    fi
  elif [[ "$path" =~ ^/([a-zA-Z])(/.*)?$ ]] && [[ "$ENV" == "wsl" ]]; then
    local drive="${BASH_REMATCH[1],}"
    local rest="${BASH_REMATCH[2]}"
    path="/mnt/$drive$rest"
  fi

  echo "$path"
}

SUCCESS=0
SKIP=0
FAIL=0

echo "=============================="
echo " AI Configs Sync  [$ENV]"
echo "=============================="

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line//$'\r'/}"
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue

  PROJECT=$(echo "$line" | cut -d':' -f1 | xargs)
  RAW_TARGET=$(echo "$line" | cut -d':' -f2- | xargs)
  TARGET=$(normalize_path "$RAW_TARGET")

  if [ -n "$SPECIFIC_PROJECT" ] && [ "$PROJECT" != "$SPECIFIC_PROJECT" ]; then
    continue
  fi

  echo ""
  echo "📦 Project : $PROJECT"
  echo "📂 Target  : $TARGET"

  if [ ! -d "$TARGET" ]; then
    echo "⚠️  Skipped — target path not found"
    ((SKIP++))
    continue
  fi

  if bash "$AI_CONFIGS_DIR/setup.sh" "$PROJECT" "$TARGET"; then
    ((SUCCESS++))
  else
    echo "❌ Failed"
    ((FAIL++))
  fi

done < "$CONF_FILE"

echo ""
echo "=============================="
echo " ✅ Success : $SUCCESS"
echo " ⏭️  Skipped : $SKIP"
echo " ❌ Failed  : $FAIL"
echo "=============================="

# Push ขึ้น git
echo ""
echo "=============================="
echo " Git Push"
echo "=============================="

cd "$AI_CONFIGS_DIR"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "⚠️  Not a git repo — skipping push"
  exit 0
fi

# Set remote ถ้ายังไม่มี
if ! git remote get-url origin > /dev/null 2>&1; then
  git remote add origin https://github.com/NesJaaTH/ai-configs.git
  echo "✅ Remote added"
fi

# ตั้ง git identity จาก gh ถ้ายังไม่มี
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  if [ -z "$(git config user.email)" ]; then
    GH_EMAIL=$(gh api user/emails --jq '[.[] | select(.primary==true)] | .[0].email' 2>/dev/null)
    GH_NAME=$(gh api user --jq '.name // .login' 2>/dev/null)
    [ -n "$GH_EMAIL" ] && git config --global user.email "$GH_EMAIL"
    [ -n "$GH_NAME" ]  && git config --global user.name  "$GH_NAME"
  fi
fi

git add -A

if git diff --cached --quiet; then
  echo "ℹ️  Nothing to commit"
else
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  if git commit -m "sync: $TIMESTAMP"; then
    echo "✅ Committed"
  else
    echo "❌ Commit failed"
    exit 1
  fi
fi

if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  if git -c credential.helper='!gh auth git-credential' push origin HEAD 2>&1; then
    echo "✅ Pushed to origin"
  else
    echo "❌ Push failed"
  fi
else
  echo "❌ Push failed — run: gh auth login"
fi
