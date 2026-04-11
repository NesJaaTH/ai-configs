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

# ตรวจสอบ environment
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

# แปลง Windows path → Unix path
normalize_path() {
  local path="$1"
  path="${path//\\//}"
  if [[ "$path" =~ ^([a-zA-Z]):/(.*)$ ]]; then
    local drive="${BASH_REMATCH[1],}"
    local rest="${BASH_REMATCH[2]}"
    [[ "$ENV" == "wsl" ]] && path="/mnt/$drive/$rest" || path="/$drive/$rest"
  elif [[ "$path" =~ ^/([a-zA-Z])(/.*)?$ ]] && [[ "$ENV" == "wsl" ]]; then
    path="/mnt/${BASH_REMATCH[1],}${BASH_REMATCH[2]}"
  fi
  echo "$path"
}

# Progress bar
progress_bar() {
  local current=$1
  local total=$2
  local width=30
  local filled=$(( current * width / total ))
  local empty=$(( width - filled ))
  local bar=""
  for ((i=0; i<filled; i++)); do bar+="█"; done
  for ((i=0; i<empty; i++));  do bar+="░"; done
  printf "\r  [%s] %d/%d" "$bar" "$current" "$total"
}

# นับจำนวน project ทั้งหมด
count_projects() {
  local count=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line//$'\r'/}"
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    local proj
    proj=$(echo "$line" | cut -d':' -f1 | xargs)
    if [ -z "$SPECIFIC_PROJECT" ] || [ "$proj" == "$SPECIFIC_PROJECT" ]; then
      ((count++))
    fi
  done < "$CONF_FILE"
  echo "$count"
}

TOTAL=$(count_projects)
CURRENT=0
SUCCESS=0
SKIP=0
FAIL=0

echo "=============================="
echo " AI Configs Sync  [$ENV]"
echo " Total projects  : $TOTAL"
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

  ((CURRENT++))

  echo ""
  progress_bar "$CURRENT" "$TOTAL"
  echo ""
  echo "  📦 $PROJECT"
  echo "  📂 $TARGET"

  if [ ! -d "$TARGET" ]; then
    echo "  ⚠️  Skipped — target path not found"
    ((SKIP++))
    continue
  fi

  DEST="$AI_CONFIGS_DIR/projects/$PROJECT"
  mkdir -p "$DEST"
  for item in CLAUDE.md .claude .cursor .agent .gemini .toh; do
    [ -e "$TARGET/$item" ] && cp -r "$TARGET/$item" "$DEST/"
  done
  echo "  📥 Collected → projects/$PROJECT/"

  ((SUCCESS++))

done < "$CONF_FILE"

echo ""
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

if ! git remote get-url origin > /dev/null 2>&1; then
  git remote add origin https://github.com/NesJaaTH/ai-configs.git
  echo "✅ Remote added"
fi

# หา gh binary — รองรับ WSL
GH_CMD=""
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  GH_CMD="gh"
elif command -v gh.exe &>/dev/null && gh.exe auth status &>/dev/null 2>&1; then
  GH_CMD="gh.exe"
fi

# ตั้ง git identity จาก gh ถ้ายังไม่มี
if [ -n "$GH_CMD" ] && [ -z "$(git config user.email)" ]; then
  GH_EMAIL=$($GH_CMD api user/emails --jq '[.[] | select(.primary==true)] | .[0].email' 2>/dev/null)
  GH_NAME=$($GH_CMD api user --jq '.name // .login' 2>/dev/null)
  [ -n "$GH_EMAIL" ] && git config --global user.email "$GH_EMAIL"
  [ -n "$GH_NAME" ]  && git config --global user.name  "$GH_NAME"
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

if [ -n "$GH_CMD" ]; then
  if git -c "credential.helper=!$GH_CMD auth git-credential" push origin HEAD 2>&1; then
    echo "✅ Pushed to origin"
  else
    echo "❌ Push failed"
  fi
else
  echo "❌ Push failed — run: gh auth login  (or install gh in WSL)"
fi
