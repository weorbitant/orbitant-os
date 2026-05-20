# CLAUDE.md

## Project Overview

This is **orbitant-os**, Orbitant's Claude Code plugin marketplace. It contains skills, agents, and commands organized by business vertical. The repo functions as a plugin marketplace that anyone on the team can install with:

```bash
/plugin marketplace add weorbitant/orbitant-os
/plugin install orbitant-marketing
```

**Website:** <https://weorbitant.github.io/orbitant-os>

## Repo Structure

```
orbitant-os/
├── .claude/
│   ├── CLAUDE.md                   <- this file (project instructions for Claude)
│   └── skills/                     <- internal skills (repo maintenance, not user-facing)
│       ├── release-notes/          <- drafts release notes from git history
│       └── skill-reviewer/         <- reviews SKILL.md files for quality
├── .claude-plugin/
│   └── marketplace.json            <- THE marketplace manifest (lists all plugins)
├── plugins/
│   ├── orbitant-marketing/         <- v1.4.0 — blog-post-review, blog-post-create, blog-post-translate, tone, yt-description, linkedin-post, image-creation, newsletter
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   ├── orbitant-operations/        <- v1.0.0 — combined chief-of-staff + business: graceful-degradation, goal-alignment, voice-drafting, plus /challenge, /highlight, /opportunity, /todo, /query, /preflight, /report, /status, /today, /triage, /week, /prep, /crm
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── skills/
│   │   ├── commands/
│   │   ├── agents/
│   │   │   ├── airtable-fetcher.md
│   │   │   ├── enrichment-agent.md
│   │   │   ├── factorial-fetcher.md
│   │   │   ├── hubspot-fetcher.md
│   │   │   ├── sherpa-fetcher.md
│   │   │   └── triage-agent.md
│   │   ├── crm/
│   │   ├── reports/
│   │   └── references/
│   └── orbitant-engineering/       <- v0.1.1 — ai-readiness, git-hygiene, owasp-scan, 12-factor, debrief (+ /ground-control)
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── commands/
│       └── skills/
├── website/                        <- Astro + Starlight documentation site
│   ├── astro.config.mjs
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── content/
│   │   │   ├── docs/               <- Documentation pages (MDX)
│   │   │   ├── blog/               <- Manual blog posts (MDX)
│   │   │   └── generated/          <- Auto-generated JSON (plugins, skills, blog)
│   │   ├── pages/                  <- Dynamic pages (plugins, skills, blog)
│   │   ├── scripts/
│   │   │   ├── parse-plugins.ts    <- Build-time plugin parser
│   │   │   └── parse-blog.ts       <- Build-time blog parser (local + GitHub releases)
│   │   └── styles/
│   └── tsconfig.json
├── .github/
│   ├── assets/
│   ├── schemas/
│   └── workflows/
│       ├── validate.yml            <- CI pipeline
│       └── deploy-website.yml      <- Website deployment to GitHub Pages
├── scripts/
├── package.json
└── README.md
```

## Website

The documentation website is built with Astro + Starlight and deployed to GitHub Pages.

### Development

```bash
npm install                # Install all dependencies
npm run website:dev        # Start dev server at localhost:4321
npm run website:build      # Build static site
npm run website:preview    # Preview built site
```

### How It Works

1. **Plugin Parser** (`website/src/scripts/parse-plugins.ts`) reads `plugins/` at build time
2. **Blog Parser** (`website/src/scripts/parse-blog.ts`) reads local MDX posts + fetches GitHub releases
3. Generates JSON files in `website/src/content/generated/`
4. Dynamic pages (`src/pages/plugins/`, `src/pages/skills/`, `src/pages/blog/`) render from generated data
5. Static docs live in `src/content/docs/`

### Adding Pages

- **Docs**: Add `.mdx` files to `website/src/content/docs/` and update sidebar in `astro.config.mjs`
- **Blog posts**: Add `.mdx` files to `website/src/content/blog/` with frontmatter (see Blog System below)

### Blog System

Blog posts come from **two sources**:

1. **Manual posts** — MDX files in `website/src/content/blog/`
2. **Release posts** — Auto-generated from GitHub releases at build time

#### Manual Blog Posts

Create `website/src/content/blog/{date}-{slug}.mdx`:

```yaml
---
title: "Post Title"
description: "Short description"
date: "2026-03-03"
author: "Orbitant Team"
tags: announcement, guide
---

Content here...
```

#### Release Posts (Auto-generated)

When you create a GitHub release with tag `orbitant-{plugin}-v{X.Y.Z}`:
1. The blog parser fetches it at build time
2. Creates a blog post with tags: `release`, `{plugin-name}`
3. Appears on `/blog/` with the "release" tag filter

#### Creating Releases

1. Use the `release-notes` internal skill to draft notes
2. Create git tag: `git tag orbitant-{plugin}-v{X.Y.Z} {commit}`
3. Push tag: `git push origin orbitant-{plugin}-v{X.Y.Z}`
4. Create GitHub release: `gh release create orbitant-{plugin}-v{X.Y.Z} --title "..." --notes "..."`
5. On next website build, release appears as blog post

#### Tag Filtering

Blog supports filtering by tags via URL: `/blog/?tag=release`

### Deployment

Automatic via `.github/workflows/deploy-website.yml`:
- Triggers on push to `main` when `website/**`, `plugins/**`, or `marketplace.json` changes
- Builds and deploys to GitHub Pages at `weorbitant.github.io/orbitant-os`

## Plugin Structure

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

### When Adding a New Skill
1. Create folder: `plugins/orbitant-{vertical}/skills/{skill-name}/`
2. Write `SKILL.md` with proper frontmatter (see above)
3. Optionally add `README.md`, `scripts/`, `references/`, `assets/`
4. Add the skill path to `marketplace.json` -> corresponding plugin's `skills` array
5. Bump version in `plugin.json`
6. Open a PR

### When Adding a New Vertical
1. Create `plugins/orbitant-{vertical}/` with full structure (`.claude-plugin/plugin.json`, `skills/`, `agents/`, `commands/`)
2. Add the plugin entry to `.claude-plugin/marketplace.json`
3. Update `README.md` table
4. Create a GitHub release when publishing

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

## Current State

| Plugin | Version | Status | Skills | Commands |
|--------|---------|--------|--------|----------|
| orbitant-marketing | 1.5.0 | Active | `orbitant-blog-post-review`, `orbitant-blog-post-create`, `orbitant-blog-post-translate`, `orbitant-tone`, `orbitant-yt-description`, `orbitant-linkedin-post`, `orbitant-image-creation`, `orbitant-newsletter`, `orbitant-slack-triage-agent` | — |
| orbitant-operations | 1.0.0 | Active | `orbitant-graceful-degradation`, `orbitant-goal-alignment`, `orbitant-voice-drafting` | `/preflight`, `/status`, `/today`, `/triage`, `/week`, `/prep`, `/crm`, `/challenge`, `/highlight`, `/opportunity`, `/todo`, `/query`, `/report` |
| orbitant-engineering | 0.1.1 | Active | `orbitant-ai-readiness`, `orbitant-git-hygiene`, `orbitant-owasp-scan`, `orbitant-12-factor`, `orbitant-debrief` | `/ground-control` |

## Scripts

```bash
# Validation
npm run check              # Run lint + validate (same as CI)
npm run lint               # Markdown linting
npm run validate           # Schema validations
npm run check:upstream     # Check forked skills for upstream changes

# Website
npm run website:dev        # Dev server
npm run website:build      # Build static site
npm run website:preview    # Preview build
```

## Language

The team works in Spanish and English. Code comments, commit messages, and technical docs are in English. Skills that interact with users should respect the language of the input.

## Do NOT

- Do NOT create skills without the `orbitant-` prefix in the name.
- Do NOT put skills directly in the repo root — they MUST live inside a plugin under `plugins/`.
- Do NOT exceed 500 lines in a single SKILL.md without using progressive disclosure (`references/`).
- Do NOT forget to update `marketplace.json` when adding or modifying skills.
- Do NOT manually edit files in `website/src/content/generated/` — they are auto-generated.
