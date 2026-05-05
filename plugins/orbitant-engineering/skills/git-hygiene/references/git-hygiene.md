# Git Hygiene — Reference Standards

Static checks observable from repo history and tracked files. No runtime access needed.

The goal is not to teach standards — it's to surface whether the project actually follows them.

---

## Critical (P0) — Immediate risk

### No secrets in tracked files
- No `.env` files tracked: `git ls-files | grep -E '\.env$'`
- No keys/tokens in code: scan for patterns `sk-`, `ghp_`, `AKIA`, `-----BEGIN`, `password =`
- No certificate files tracked: `git ls-files | grep -E '\.(pem|key|p12|pfx)$'`
- **Also check history**: `git log --all --full-history -- "*.env"`
- Any match → P0 finding regardless of other scores

---

## Must have

### .gitignore is present and covers the basics
- File exists at repo root
- Covers: build artifacts, OS files (`.DS_Store`, `Thumbs.db`), editor dirs (`.idea/`, `.vscode/`)
- Covers dependency dirs for detected stack (`node_modules/`, `vendor/`, `__pycache__/`, etc.)

### Commits follow Conventional Commits
- Orbitant standard: `<type>(<scope>): <description>`
- Valid types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`
- **How to check**: sample last 20 commits, count how many match the pattern
- **Report**: "X/20 commits follow Conventional Commits" — show the offending ones

### Branch names follow the standard
- Orbitant standard: `feat/<name>`, `fix/<name>`, `chore/<name>`, `hotfix/<name>`
- **How to check**: `git branch -a` — flag any branch not matching the pattern
- Exceptions: `main`, `master`, `develop`, `staging`, `production`
- **Report**: list non-compliant branches by name

### No direct commits to main
- **How to check**: scan last 50 commits on `main` — are there commits not introduced via merge/PR?
- Heuristic: commits on `main` should mostly be merge commits or squash merges
- **Fail signal**: multiple non-merge commits directly on `main` from recent history

---

## Recommended

### Stale branches cleaned up
- Flag branches with last commit >60 days that aren't `main`, `develop`, `staging`, or `production`
- **Report**: list stale branch names + last commit date

### Releases are tagged
- `git tag -l` shows version tags following semver or a consistent pattern
- **Fail signal**: no tags on a project active for >3 months

### PR templates or CODEOWNERS defined
- `.github/PULL_REQUEST_TEMPLATE.md` exists
- `.github/CODEOWNERS` maps paths to owners
- Signals that the team has a review process

### Git hooks enforce standards locally
- `.husky/` or `.githooks/` present
- Ideally: commit-msg hook validates Conventional Commits, pre-commit runs lint
- **Why it matters**: hooks prevent the problem at source instead of detecting it after

---

## Scoring

| Result | Rating |
|---|---|
| Any P0 finding | ❌ Critical — fix before anything else |
| All "Must have" pass | ✅ Compliant |
| "Must have" + 3+ "Recommended" | 🚀 Strong hygiene |
| Any "Must have" failing (no P0) | ⚠️ Needs work |

---

## Findings format

For each failing check, report:

```
⚠️  Conventional Commits not enforced
    Last 20 commits: 4/20 compliant
    Non-compliant examples:
      - "fix stuff" (a3f1c2)
      - "updated file" (b9e2d1)
      - "wip" (cc41fa)
    Recommendation: add commitlint + husky commit-msg hook
```
