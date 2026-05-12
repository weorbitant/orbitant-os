---
name: orbitant-ai-readiness
description: |
  Use when auditing whether a repo is configured for AI-assisted development —
  checking .claude/ setup quality, CLAUDE.md completeness, skills/agents presence,
  hooks, memory, or MCP server configuration. Activates when someone asks "is this
  repo AI-ready?", "how well is Claude configured here?", or wants to assess
  AI readiness before starting work on an unfamiliar project. Also trigger when
  reviewing any .claude/ config, CLAUDE.md quality, or hooks setup — even if the
  user doesn't explicitly mention "AI readiness".
version: "0.1.0"
license: MIT
metadata:
  author: orbitant
  tags: engineering, audit, ai-readiness, claude, dx
---

## Overview

Audits a repo's AI readiness — how well it's configured for Claude Code and AI-assisted development. Produces a structured report with a rating and actionable findings.

All checks are static. No runtime access, no external APIs.

---

## When to Use

- Starting work on an unfamiliar repo and want to assess AI setup quality
- Reviewing a client project before an engagement
- Someone asks "is this repo ready for AI development?"
- Running a section audit after `/orbitant-engineering:ground-control` flagged AI readiness issues

---

## How to Run

Load the reference standards:

`@plugins/orbitant-engineering/skills/ai-readiness/references/ai-readiness.md`

Then check the repo against every item in that file. Collect all findings before printing the report.

---

## Output Format

```
## AI Readiness Audit   {rating}

### Passing
- CLAUDE.md present and substantive
- .claude/ directory exists
- ...

### Failing
- Agents not defined despite complex codebase
  Finding: No .claude/agents/ directory
  Recommendation: Define agents per sub-domain (API, frontend, infra)

### Improvement opportunities (Tier 3)
- Memory system not configured
- No MCP servers declared

Rating: ✅ Operational
```

Ratings: ❌ Not AI-ready / ⚠️ Minimal / ✅ Operational / 🚀 Optimized

See `references/ai-readiness.md` for full scoring criteria.
