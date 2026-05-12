---
name: orbitant-git-hygiene
description: |
  Use when auditing git practices in a repo — Conventional Commits compliance,
  branch naming standards, secrets committed to history, direct commits to main,
  or stale branches. Activates when someone asks "is the git hygiene good here?",
  wants to check commit discipline, or needs to assess branch/release health
  before starting work on a project. Also trigger when someone asks "are my commits
  OK?", "is my branch name right?", or shares a git log — even if they don't
  explicitly mention "hygiene".
version: "0.1.0"
license: MIT
metadata:
  author: orbitant
  tags: engineering, audit, git, hygiene, commits, branches
---

## Overview

Audits git practices against Orbitant's engineering standards. Surfaces what's not following the standard — with file names, commit hashes, and branch names as evidence.

All checks are static. Derived from git history and tracked files.

---

## When to Use

- Checking if a project follows Conventional Commits
- Auditing branch naming discipline
- Scanning for committed secrets before a security review
- Running a section audit after `/orbitant-engineering:ground-control` flagged git hygiene

---

## How to Run

Load the reference standards:

`@plugins/orbitant-engineering/skills/git-hygiene/references/git-hygiene.md`

Key commands to run:
```bash
git ls-files | grep -E '\.env$'
git log --oneline -20
git branch -a
```

Collect all findings before printing the report.

---

## Output Format

```
## Git Hygiene Audit   {rating}

### 🔴 Critical (fix first)
- .env file tracked in git
  File: config/.env
  Recommendation: remove from tracking, rotate any exposed secrets, add to .gitignore

### Passing
- .gitignore present and covers Node.js stack
- No direct commits to main in last 20 commits

### Failing
- Conventional Commits not enforced
  Finding: 4/20 commits compliant
  Examples: "fix stuff" (a3f1c2), "wip" (b9e2d1)
  Recommendation: add commitlint + husky commit-msg hook

Rating: ⚠️ Needs work
```

Ratings: ❌ Critical / ⚠️ Needs work / ✅ Compliant / 🚀 Strong hygiene

See `references/git-hygiene.md` for full scoring criteria and check details.
