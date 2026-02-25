# CLAUDE.md

## Project Overview

This is **orbitant-os**, Orbitant's Claude Code plugin marketplace. It contains skills, agents, and commands organized by business vertical. The repo functions as a plugin marketplace that anyone on the team can install with:

```bash
/plugin marketplace add weorbitant/orbitant-os
/plugin install orbitant-marketing
```

## Repo Structure

```
orbitant-os/
├── .claude/
│   └── CLAUDE.md                   <- this file (project instructions for Claude)
├── .claude-plugin/
│   └── marketplace.json            <- THE marketplace manifest (lists all plugins)
├── plugins/
│   ├── orbitant-marketing/         <- v1.1.0 — blog-post-review, blog-post-create, blog-post-translate, tone
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   │       ├── blog-post-review/
│   │       ├── blog-post-create/
│   │       ├── blog-post-translate/
│   │       └── tone/
│   └── orbitant-chief-of-staff/    <- v1.3.1 — graceful-degradation, goal-alignment, voice-drafting
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── skills/
│       ├── commands/
│       ├── agents/
│       ├── crm/
│       └── references/
├── .github/
│   ├── assets/                     <- images and screenshots
│   ├── schemas/                    <- JSON schemas for validation
│   └── workflows/
│       └── validate.yml            <- CI pipeline
├── scripts/                        <- validation scripts
├── .gitignore
├── CONTRIBUTING.md
├── FAQ.md
├── LICENSE
├── package.json
└── README.md
```

Each plugin follows this structure:

```
plugins/orbitant-{vertical}/
├── .claude-plugin/
│   └── plugin.json                 <- plugin metadata + version
├── skills/
│   └── {skill-name}/
│       ├── SKILL.md                <- required (frontmatter + instructions)
│       ├── README.md               <- optional (human docs)
│       ├── scripts/                <- optional (executable code)
│       ├── references/             <- optional (docs loaded on demand)
│       └── assets/                 <- optional (templates, fonts, images)
├── agents/
│   └── {agent-name}.md             <- specialized sub-agents
└── commands/
    └── {command-name}.md           <- slash commands (/orbitant-{vertical}:{name})
```

## Conventions — Follow These Strictly

### Naming
- **Skill names** in SKILL.md frontmatter MUST be prefixed: `orbitant-{short-name}` (e.g., `orbitant-blog-post-review`). This avoids collisions with community skills.
- **Skill folders**: kebab-case (e.g., `blog-post-review/`)
- **Agent files**: kebab-case `.md` (e.g., `content-strategist.md`)
- **Command files**: kebab-case `.md` (e.g., `generate-copy.md`)
- **Plugin folders**: `orbitant-{vertical}` (e.g., `orbitant-marketing`)

### SKILL.md Frontmatter (required fields)
```yaml
---
name: orbitant-{short-name}          # ALWAYS prefix with orbitant-
description: |                        # Be specific AND pushy — Claude undertriggers otherwise
  What the skill does. When to activate it.
  Include trigger phrases, edge cases, and "even if they don't
  explicitly mention X" clauses.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: comma, separated, tags
---
```

### Writing Good Skills
- Keep SKILL.md under 500 lines. If longer, move details to `references/` files.
- Write for another Claude instance — include non-obvious procedural knowledge.
- The `description` field is the PRIMARY triggering mechanism. Make it comprehensive.
- Use `disable-model-invocation: true` in frontmatter for dangerous/manual-only skills.
- The reference implementation is `plugins/orbitant-marketing/skills/blog-post-review/SKILL.md` — use it as a template for quality and structure.

### Writing Agents
```yaml
---
name: agent-name
description: What this agent specializes in
allowed-tools: Bash, Read, Write    # restrict tools for safety
---
```

### Writing Commands
```yaml
---
name: command-name
description: What this command does when invoked via /orbitant-{vertical}:command-name
---
```

### Versioning
- Semantic versioning (MAJOR.MINOR.PATCH)
- Bump version in `plugins/orbitant-{vertical}/.claude-plugin/plugin.json`
- Update `marketplace.json` version for the corresponding plugin entry
- Create a GitHub release with release notes
- Git tags follow format: `orbitant-{vertical}-v{X.Y.Z}`

### When Adding a New Skill
1. Create folder: `plugins/orbitant-{vertical}/skills/{skill-name}/`
2. Write `SKILL.md` with proper frontmatter (see conventions above)
3. Optionally add `README.md`, `scripts/`, `references/`, `assets/`
4. Add the skill path to `marketplace.json` -> corresponding plugin's `skills` array
5. Bump version in `plugin.json`
6. Create a GitHub release when publishing

### When Adding a New Vertical
1. Create `plugins/orbitant-{vertical}/` with full structure (`.claude-plugin/plugin.json`, `skills/`, `agents/`, `commands/`)
2. Add the plugin entry to `.claude-plugin/marketplace.json`
3. Update `README.md` table
4. Create a GitHub release when publishing

## Current State

| Plugin | Version | Status | Skills | Commands |
|--------|---------|--------|--------|----------|
| orbitant-marketing | 1.1.0 | Active | `orbitant-blog-post-review`, `orbitant-blog-post-create`, `orbitant-blog-post-translate`, `orbitant-tone` | — |
| orbitant-chief-of-staff | 1.3.1 | Active | `orbitant-graceful-degradation`, `orbitant-goal-alignment`, `orbitant-voice-drafting` | `/preflight`, `/status`, `/today`, `/triage`, `/week`, `/prep`, `/crm` |

## Language

The team works in Spanish and English. Code comments, commit messages, and technical docs are in English. Skills that interact with users should respect the language of the input (see blog-post-review for an example of language detection via frontmatter `lang` field).

## Do NOT

- Do NOT create skills without the `orbitant-` prefix in the name.
- Do NOT put skills directly in the repo root — they MUST live inside a plugin under `plugins/`.
- Do NOT exceed 500 lines in a single SKILL.md without using progressive disclosure (`references/`).
- Do NOT forget to update `marketplace.json` when adding or modifying skills.
