# AI Readiness — Reference Standards

This file defines what "AI-ready" means for a repo in Orbitant's engineering context.
These checks are purely static — no runtime access, no external APIs.

---

## Tier 1 — Non-negotiable (must have)

### CLAUDE.md present and substantive
- `CLAUDE.md` exists at repo root or in `.claude/`
- Contains at least: project overview, tech stack, key commands (build, test, lint)
- **Fail signal**: file missing, empty, or only has "TODO" content

### Claude Code is the intended AI editor
- `.claude/` directory exists
- No conflicting AI editor config that contradicts Claude Code usage (e.g. `.cursor/rules` pointing to different conventions)

### Commands are documented
- Key dev commands are discoverable without reading source (in CLAUDE.md or README)
- A new engineer (or AI agent) can `build`, `test`, and `lint` from the docs alone
- **Fail signal**: commands only discoverable by reading `package.json`, `Makefile`, or CI config

---

## Tier 2 — Strongly recommended

### .claude/settings.json exists
- Project-level settings present
- Preferred: explicit `allowedTools` or `blockedTools` for this project's context
- Preferred: at least one hook configured (pre-tool, post-tool, or stop)

### Agents defined for non-trivial domains
- If the project has distinct sub-domains (API, frontend, infra, data), agents are defined per domain
- Agent files in `.claude/agents/` with `allowed-tools` scoped appropriately
- **Fail signal**: monolithic CLAUDE.md trying to cover everything without agent specialization

### Skills present and namespaced
- Project-specific skills live in `.claude/skills/`
- Skill names are prefixed (no generic names that collide with community skills)
- Each skill has a description specific enough to trigger without explicit invocation

### Context files referenced from CLAUDE.md
- Architecture diagrams, ADRs, or key design docs are linked or `@included`
- AI agents can discover important context without needing to ask
- **Fail signal**: important architecture decisions exist only in Notion/Confluence, not in the repo

---

## Tier 3 — Maturity indicators (nice to have)

### Memory system configured
- Project has a memory directory (`.claude/memory/` or equivalent)
- MEMORY.md index exists with entries
- Memories are typed (user, feedback, project, reference)

### MCP servers declared
- `.claude/mcp.json` or equivalent lists project-relevant MCP servers
- Each server has a clear purpose documented
- **Example**: Atlassian MCP for Jira-linked repos, Serena for deep code navigation

### Serena or equivalent code intelligence configured
- `.serena/` config exists OR Serena MCP is declared in settings
- Enables symbolic navigation instead of file-by-file reading
- **Why it matters**: agents that use symbolic tools are 3-5x faster on large codebases

### Hooks automate quality gates
- Pre-tool hooks block dangerous operations (e.g. prevent direct `main` commits)
- Post-tool hooks enforce linting or formatting after edits
- Stop hooks surface summaries or notify on task completion

### CLAUDE.md references team conventions
- Branching strategy documented
- Commit message format documented (e.g. Conventional Commits)
- PR process documented (labels, reviewers, merge strategy)

---

## Scoring

| Tier 1 items passing | Tier 2 items passing | Rating |
|---|---|---|
| 0–1 | any | ❌ Not AI-ready |
| 2–3 | 0–1 | ⚠️ Minimal |
| 3 | 2–3 | ✅ Operational |
| 3 | 4–5 | 🚀 Optimized |

**Note**: Tier 3 items don't affect the rating — they surface as improvement opportunities.

---

## Common failure patterns

| Pattern | What it signals |
|---|---|
| CLAUDE.md exists but is generic boilerplate | AI was used to scaffold the repo but setup was never tailored |
| `.claude/` folder missing entirely | Team hasn't adopted AI-assisted development |
| Skills present but no `description` field | Skills won't auto-trigger; team has to remember to invoke manually |
| No agents despite large/complex codebase | AI will use monolithic context, leading to slower and less accurate responses |
| Hooks missing | Quality gates are manual; regressions more likely in AI-assisted PRs |
