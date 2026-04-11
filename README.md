# ai-configs

Central repository for managing AI assistant configuration files across multiple projects.

## What's in here

```
ai-configs/
├── base/
│   └── CLAUDE.md          # Base config template (used when no project-specific config exists)
├── projects/
│   └── <project-name>/    # Per-project overrides
│       ├── CLAUDE.md
│       ├── .claude/
│       ├── .cursor/
│       ├── .agent/
│       └── ...
├── projects.conf          # List of projects and their local paths
├── setup.sh               # Copies configs into a single project
└── sync.sh                # Syncs all projects + pushes to git
```

## Setup

```bash
# Clone the repo
git clone https://github.com/NesJaaTH/ai-configs.git
cd ai-configs
```

Edit `projects.conf` to register your projects:

```
# format: [project-name]:[path]
miruway-api:D:/git/Miruway/Miruway-Api
my-other-project:/Users/me/code/other-project
```

Paths support:
- Windows: `D:/git/project` or `D:\git\project`
- macOS / Linux: `/Users/me/project`

Runs on: **Windows (Git Bash / WSL)** and **macOS**.

## Usage

**Sync all projects** (copies configs + git push):

```bash
bash sync.sh
```

**Sync a single project:**

```bash
bash sync.sh miruway-api
```

## How it works

1. `sync.sh` reads `projects.conf` and calls `setup.sh` for each project
2. `setup.sh` copies `CLAUDE.md` and hidden AI folders (`.claude/`, `.cursor/`, `.agent/`, etc.) into the target project
3. If a project-specific folder exists under `projects/<name>/`, it uses that — otherwise falls back to `base/CLAUDE.md`
4. After syncing, `sync.sh` commits and pushes changes to this repo

## Adding a new project

1. Add an entry to `projects.conf`
2. (Optional) Create `projects/<project-name>/` and add custom configs
3. Run `bash sync.sh <project-name>`

## Supported AI config folders

| Folder | Tool |
|--------|------|
| `CLAUDE.md` | Claude (Anthropic) |
| `.claude/` | Claude Code |
| `.cursor/` | Cursor |
| `.agent/` | Custom agents |
| `.gemini/` | Gemini |
| `.toh/` | Other |
