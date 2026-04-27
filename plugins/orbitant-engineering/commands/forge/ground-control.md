---
name: ground-control
description: |
  Full engineering standards audit for any repo. Scans the current working directory
  and produces a structured report across four areas: AI readiness, git hygiene,
  OWASP security patterns, and 12-factor compliance. Run this on any project to surface
  what doesn't meet Orbitant's engineering standards — no external APIs, no runtime needed.
model: claude-opus-4-6
---

## Overview

`/ground-control` is a repo audit command. It scans the current directory statically and produces a findings report across four sections. It does not fix anything — it surfaces what needs attention.

Run it at the start of a new client engagement, after a long period of low activity on a repo, or as a periodic health check.

**Scope**: static analysis only. No external API calls. No runtime execution. Everything is derived from files and git history in the current directory.

---

## Before You Start

Load the four reference files. These define exactly what to check in each section:

- `@plugins/orbitant-engineering/skills/ai-readiness/references/ai-readiness.md`
- `@plugins/orbitant-engineering/skills/git-hygiene/references/git-hygiene.md`
- `@plugins/orbitant-engineering/skills/owasp-scan/references/owasp-patterns.md`
- `@plugins/orbitant-engineering/skills/12-factor/references/12-factor.md`

If running from outside the orbitant-os repo, the references are embedded at the bottom of this command file.

---

## Execution Steps

Run these steps in order. Collect all findings before printing the report.

### Step 0 — Detect stack

Before auditing, understand what you're looking at:

- Check for `package.json` → Node.js project
- Check for `requirements.txt` / `pyproject.toml` / `setup.py` → Python project
- Check for both → monorepo or mixed stack
- Check for `Dockerfile`, `docker-compose.yml` → containerized
- Check for `.github/workflows/` → GitHub Actions CI
- Note the detected stack at the top of the report

### Step 1 — AI Readiness

Follow the checks defined in `ai-readiness.md`.

Key checks:
- `CLAUDE.md` present and substantive (not empty, not boilerplate)
- `.claude/` directory exists
- Key commands documented in CLAUDE.md or README
- `.claude/settings.json` present
- Agents defined if project has multiple sub-domains
- Skills present and namespaced
- Context files referenced from CLAUDE.md

Assign a rating: ❌ Not AI-ready / ⚠️ Minimal / ✅ Operational / 🚀 Optimized

### Step 2 — Git Hygiene

Follow the checks defined in `git-hygiene.md`.

Key checks:
- No secrets in tracked files (`git ls-files` scan)
- `.gitignore` present and covers the detected stack
- Last 20 commits: count Conventional Commits compliance
- Last 20 commits: check for direct commits to main
- Branch names: `git branch -a` scan for non-compliant names
- Stale branches (last commit >60 days)

Commands to run:
```
git ls-files | grep -E '\.env$'
git log --oneline -20
git branch -a
```

Assign a rating: ❌ Critical / ⚠️ Needs work / ✅ Compliant / 🚀 Strong hygiene

### Step 3 — OWASP Patterns

Follow the checks defined in `owasp-patterns.md`. Scope grep to detected stack (Node.js patterns, Python patterns, or both).

Key checks:
- Hardcoded secrets (grep across all source files, exclude test fixtures)
- Dangerous functions: `eval`, `exec`, `child_process.exec`, `pickle.loads`, `shell=True`
- Weak crypto: MD5/SHA1 for security, `Math.random()` for tokens
- SQL injection patterns: string interpolation in queries
- Security misconfig: permissive CORS, DEBUG=True, hardcoded secrets
- Missing `helmet` (Express apps)
- Dependency lockfile present
- Logs exposing sensitive data

P0 findings must be surfaced immediately at the top of the report, before section breakdown.

Assign a rating: ❌ Critical / ⚠️ Needs work / ✅ Compliant / 🚀 Strong

### Step 4 — 12-Factor Compliance

Follow the checks defined in `12-factor.md`. Only statically verifiable factors are scored.

Key checks:
- **II. Dependencies**: lockfile present, versions pinned
- **III. Config**: no hardcoded URLs/credentials, `.env.example` present
- **V. Build/release/run**: CI pipeline defined, build and deploy separated
- **X. Dev/prod parity**: Dockerfile present, no environment-gated business logic
- **XI. Logs**: no log file writes, structured logging library present

Note which factors were skipped (I, IV, VI, VII, VIII, IX, XII) and why.

Assign a rating: ❌ Not compliant / ⚠️ Partial / ✅ Good / 🚀 Fully observable compliance

---

## Output Format

```
# Ground Control — Engineering Audit
{repo name} · {date} · {detected stack}

---

## 🔴 Critical Findings (fix first)

{List any P0 findings from git hygiene or OWASP here, before section breakdowns.
If none, write "No critical findings."}

---

## Section 1 — AI Readiness   {rating}

### Passing
- {check name}
- ...

### Failing
- {check name}
  Finding: {what was found}
  Recommendation: {concrete next step}

---

## Section 2 — Git Hygiene   {rating}

### Passing
- ...

### Failing
- Conventional Commits not enforced
  Finding: 4/20 commits follow the standard
  Non-compliant: "fix stuff" (a3f1c2), "wip" (b9e2d1), "updated" (cc41fa)
  Recommendation: add commitlint + husky commit-msg hook

---

## Section 3 — OWASP Patterns   {rating}

### Passing
- ...

### Failing
- {pattern name}
  Location: {file}:{line}
  Finding: {what was found}
  Recommendation: {concrete next step}

---

## Section 4 — 12-Factor   {rating}

### Passing (factors checked)
- ...

### Failing
- ...

### Not checked (requires runtime)
- Factors I, IV, VI, VII, VIII, IX, XII — see references/12-factor.md for details

---

## Summary

| Section | Rating |
|---|---|
| AI Readiness | {rating} |
| Git Hygiene | {rating} |
| OWASP Patterns | {rating} |
| 12-Factor | {rating} |

Total findings: {N critical, N warnings, N recommendations}

Next steps:
1. {Most important action}
2. {Second most important action}
3. {Third most important action}
```

---

## Notes

- Show the passing checks too — a clean section deserves acknowledgment.
- Be specific in findings: file names, line numbers, commit hashes, branch names.
- Recommendations must be actionable: a command, a library, a config change — not "improve X".
- If the repo is very clean, say so clearly. The goal is accuracy, not finding problems.
