# 📓 Anytype Manager Skill

> **Purpose:** Create, update, and manage Anytype pages beautifully and correctly
> **Version:** 1.0.0
> **Covers:** MCP setup, content formatting, page structure, error handling

---

## Overview

Anytype is a local-first knowledge management app with a REST-like MCP API.
This skill teaches you how to write content that renders beautifully, avoid known
pitfalls, and structure pages so they are easy to read and navigate.

### Key Principles

- ✅ **Local-first** — Anytype app must be running for MCP to work (port 31009)
- ✅ **Markdown content** — All page content is written in markdown
- ✅ **Two separate configs** — Claude Desktop ≠ Claude Code CLI settings
- ✅ **create uses `body`** — `update` uses `markdown` (different field names!)
- ✅ **No icon on update** — Never pass `icon` in `update-object` calls (400 error)

---

## ⚙️ Configuration

### Claude Code CLI (`~/.claude/settings.json`)

```json
{
  "mcpServers": {
    "anytype": {
      "command": "npx",
      "args": ["-y", "@anyproto/anytype-mcp"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer YOUR_KEY_HERE\", \"Anytype-Version\":\"2025-11-08\"}"
      }
    }
  }
}
```

### Claude Desktop (`AppData/Roaming/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "anytype": {
      "command": "npx",
      "args": ["-y", "@anyproto/anytype-mcp"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer YOUR_KEY_HERE\", \"Anytype-Version\":\"2025-11-08\"}"
      }
    }
  }
}
```

> ⚠️ Claude Desktop and Claude Code CLI use **different API keys**
> Generate separate keys in Anytype app → Settings → API

### How to Get API Key

```
Anytype App → Settings (gear icon) → API (or Integrations)
→ Create new key → Copy → paste into config above
```

### Verify Connection

```bash
claude mcp get anytype
# Should show: anytype (connected)
```

---

## 🛠️ Available MCP Tools

### Space Management

| Tool | When to Use |
|------|-------------|
| `API-list-spaces` | Always call first — get space IDs |
| `API-get-space` | Get space details |
| `API-create-space` | Create new workspace |

### Object (Page) Management

| Tool | Parameters | Notes |
|------|------------|-------|
| `API-create-object` | `space_id`, `type_key`, `name`, `body`, `icon` | Use `body` for content |
| `API-update-object` | `space_id`, `object_id`, `name`, `markdown` | Use `markdown` for content |
| `API-get-object` | `space_id`, `object_id`, `format: "md"` | Returns full markdown |
| `API-delete-object` | `space_id`, `object_id` | Permanent delete |
| `API-list-objects` | `space_id`, `type_key` | List pages |

### Search

| Tool | When to Use |
|------|-------------|
| `API-search-space` | Search within one space |
| `API-search-global` | Search across all spaces |

---

## 🚨 Critical Rules (NEVER VIOLATE)

```
┌─────────────────────────────────────────────────────────┐
│ RULE 1: create-object  → content field = "body"         │
│         update-object  → content field = "markdown"     │
│         (Using wrong field = content not saved!)        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RULE 2: NEVER pass "icon" in update-object calls        │
│         (Causes 400 Bad Request every time)             │
│         Only use icon in create-object                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RULE 3: ALWAYS call API-list-spaces first               │
│         Space IDs change across sessions                │
│         Never hardcode space IDs                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RULE 4: Anytype app MUST be open on desktop             │
│         MCP connects to localhost:31009                 │
│         If 401 error → app not open or wrong API key   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RULE 5: ALWAYS add language specifier to code blocks    │
│         ``` (no lang) = plain text, NO syntax highlight │
│         ```bash, ```yaml, ```go etc. = proper highlight │
│         Exception: ASCII diagrams/trees → use ```text  │
└─────────────────────────────────────────────────────────┘
```

### Code Block Language Reference

| Content Type | Language Specifier |
|:------------|:------------------|
| Shell commands, CLI | `bash` |
| YAML (docker-compose, K8s, GitHub Actions, Ansible) | `yaml` |
| Dockerfile | `dockerfile` |
| Nginx config | `nginx` |
| Terraform / HCL | `hcl` |
| Go source code | `go` |
| JSON | `json` |
| JavaScript / TypeScript | `typescript` |
| Python | `python` |
| SQL | `sql` |
| ASCII diagrams, trees, flow charts | `text` |
| Mixed / unlabeled plain text | `text` |

### Examples

````markdown
```bash
docker compose up -d
kubectl apply -f ingress.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
```

```dockerfile
FROM golang:1.25-alpine AS builder
RUN go build -o /app/server .
```

```nginx
upstream api_pool {
    least_conn;
    server 127.0.0.1:8081;
}
```

```hcl
resource "aws_instance" "app" {
  ami           = "ami-xxx"
  instance_type = "t3.small"
}
```

```text
Internet → Nginx → Docker Container
                ↓
           PostgreSQL
```
````

---

## 📝 Content Formatting Guide

### Markdown Elements That Render Well in Anytype

```markdown
# H1 — Page title (use once at top)
## H2 — Major section
### H3 — Subsection

**bold text**
*italic text*
`inline code`

> blockquote / callout text

- bullet list item
1. numbered list item

| Column A | Column B |
|----------|----------|
| value    | value    |

```code block```

---   (horizontal rule / divider)

- [ ] Checkbox (unchecked)
- [x] Checkbox (checked)
```

### Page Structure Template

Every page should follow this structure:

```markdown
# 🎯 [Page Title]

> [One-line description of what this page covers]

---

## 📚 สารบัญ (Table of Contents)

1. [Section 1](#section-1)
2. [Section 2](#section-2)
3. [Section 3](#section-3)

---

## Section 1

[Content here]

---

## Section 2

[Content here]

---

*อัปเดตล่าสุด: YYYY-MM-DD*
```

---

## 🎨 Visual Hierarchy Patterns

### Use Emoji for Section Headers

```markdown
# 🚀 Getting Started
# 🏗️ Architecture
# 📝 Notes
# ⚠️ Warnings
# ✅ Checklist
# 📚 References
# 🔧 Configuration
# 🔌 Integrations
# 📊 Monitoring
# 🔒 Security
```

### Use Code Blocks for Diagrams

```markdown
```
Architecture Diagram:

Internet → Nginx → Docker Container
                ↓
           PostgreSQL
```
```

### Use Callout Boxes for Important Notes

```markdown
> 📎 **ดูรายละเอียดเพิ่มเติมใน →** [Page Name]

> ⚠️ **คำเตือน:** อย่าลืมสำรองข้อมูลก่อน

> 💡 **เคล็ดลับ:** ใช้ least_conn แทน round-robin สำหรับ API calls
```

### Section Dividers Pattern (for technical guides)

```markdown
---

# ─── SECTION NAME ────────────────────────────────────────

[content]

---
```

---

## 📋 Standard Workflows

### Workflow 1: Create New Page

```
1. API-list-spaces         → Get space_id
2. API-create-object       → Create with:
   - type_key: "ot-page"
   - name: "Page Title"
   - body: "[full markdown content]"
   - icon: {"format": "emoji", "emoji": "🚀"}
3. Note returned object_id → For future updates
```

### Workflow 2: Update Existing Page

```
1. API-list-spaces         → Get space_id (if unknown)
2. API-get-object          → Read current content (optional)
3. API-update-object       → Update with:
   - object_id: "[known ID]"
   - markdown: "[full updated content]"
   - name: "[new name if changed]"
   ⚠️ Do NOT include icon parameter
```

### Workflow 3: Find and Update Page

```
1. API-list-spaces         → Get space_id
2. API-search-space        → Search by name
   - query: "page name"
   - types: ["page"]
3. Get object_id from results
4. API-update-object       → Update content
```

### Workflow 4: Read Before Update

```
1. API-get-object (format: "md")
2. Analyze existing content
3. Decide: append / replace / restructure
4. API-update-object with full new content
```

---

## 🚦 Error Handling

### 401 Unauthorized

```
Cause:  Wrong API key OR Anytype app not running
Fix 1:  Open Anytype desktop app
Fix 2:  Generate new key in Anytype → Settings → API
Fix 3:  Update OPENAPI_MCP_HEADERS in settings.json
Fix 4:  Restart Claude Code to reload MCP config
```

### 400 Bad Request on update-object

```
Cause:  Passing "icon" field in update-object
Fix:    Remove icon parameter completely
        Only pass: space_id, object_id, markdown, name
```

### 400 on body field

```
Cause:  Using "markdown" in create-object (or "body" in update-object)
Fix:    create-object → use "body"
        update-object → use "markdown"
```

### MCP Tools Disappear Mid-Session

```
Cause:  settings.json modified during session (triggers MCP reload)
Fix:    Use ToolSearch to reload Anytype tools
        Search: "anytype list spaces" or "anytype create object"
```

### Object Not Found

```
Cause:  Wrong object_id or deleted object
Fix:    Use API-search-space to find current ID
        IDs are permanent — never change after creation
```

---

## 💡 Content Best Practices

### DO — Makes Pages Beautiful

```markdown
✅ Start with H1 title + emoji
✅ Add subtitle as blockquote (> text)
✅ Use horizontal rules (---) between sections
✅ Use tables for comparisons
✅ Use code blocks for ALL code/configs/commands
✅ Use checkboxes (- [ ]) for checklists
✅ Add "อัปเดตล่าสุด" at bottom
✅ Keep sections short with clear headers
✅ Use callout boxes (> text) for key notes
```

### DON'T — Makes Pages Hard to Read

```markdown
❌ Long paragraphs of plain text
❌ Code without code blocks (```lang)
❌ Tables without header separators
❌ No sections / everything in one block
❌ Inconsistent emoji usage
❌ Missing TOC for long pages (>5 sections)
❌ Duplicate content across pages (link instead)
```

---

## 🔗 Cross-Page Linking Strategy

When content overlaps between pages:

### Decision Framework

```
Is the content IDENTICAL in both pages?
├── Yes → Keep in ONE page, add reference note in other
└── No (different but related) → Keep both, add cross-reference

Is the content PRACTICAL (code/config)?
├── Yes → Put in specific guide page, link from overview page
└── No (theory/concepts) → Can exist in overview page

Is the page getting TOO LONG (>10 sections)?
├── Yes → Extract to separate page, link from parent
└── No → Keep together
```

### Reference Block Template

```markdown
> 📎 **ดูรายละเอียดเต็มใน →**
> **[🔒 Page Name]** (หัวข้อ "Section Name")
```

### Adding New Section from Another Page

When extracting content from Page A to Page B:
1. Add full content to Page B under new section
2. In Page A — replace content with reference block pointing to Page B
3. Both pages updated simultaneously (use parallel API calls)

---

## 📁 Space & Object ID Reference

### Always fetch fresh — never hardcode

```
DO:
1. Call API-list-spaces at start of every task
2. Find space by name match
3. Use that session's space_id

DON'T:
- Hardcode space IDs in prompts or notes
- Assume space ID from previous session
```

### Saving Object IDs

If you create an object and need to reference it later:
- Save object_id in memory files (.claude/memory/)
- Or search by name using API-search-space

---

## ⚡ Quick Reference

### Create Page (minimal)

```
API-create-object:
  space_id: [from list-spaces]
  type_key: "ot-page"
  name: "My Page"
  body: "# My Page\n\nContent here"
  icon: {"format": "emoji", "emoji": "📄"}
```

### Update Page (minimal)

```
API-update-object:
  space_id: [from list-spaces]
  object_id: [known ID]
  markdown: "# My Page\n\nUpdated content"
```

### List All Pages in Space

```
API-list-objects:
  space_id: [from list-spaces]
  type_key: "ot-page"
  limit: 50
```

### Find Page by Name

```
API-search-space:
  space_id: [from list-spaces]
  query: "page name keyword"
  types: ["page"]
```

---

## 📊 Page Quality Checklist

Before finishing any Anytype page:

```
Structure:
□ H1 title with emoji
□ Subtitle as blockquote
□ Horizontal rule after intro
□ Table of contents (if >4 sections)
□ Sections separated by ---
□ Update date at bottom

Content:
□ All code in code blocks with language hint
□ Comparisons in tables
□ Key warnings in callout boxes (> ⚠️)
□ No duplicate content (link instead)
□ Consistent emoji use in headers

Links:
□ Cross-references to related pages
□ Reference blocks instead of duplicate code
```

---

*Last Updated: 2026-02-28*
