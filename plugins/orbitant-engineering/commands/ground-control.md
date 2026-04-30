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

## Execution Steps

Each section delegates to a dedicated skill. Invoke each skill via the `Skill` tool — do not inline the checks. Collect all findings across sections before printing the consolidated report.

Run these steps in order.

### Step 0 — Detect stack

Before auditing, understand what you're looking at:

- Check for `package.json` → Node.js project
- Check for `requirements.txt` / `pyproject.toml` / `setup.py` → Python project
- Check for both → monorepo or mixed stack
- Check for `Dockerfile`, `docker-compose.yml` → containerized
- Check for `.github/workflows/` → GitHub Actions CI
- Note the detected stack at the top of the report

### Step 1 — AI Readiness

Invoke the `orbitant-ai-readiness` skill. It defines the full check list and rating rubric for this section.

Key checks (summary):
- `CLAUDE.md` present and substantive (not empty, not boilerplate)
- `.claude/` directory exists
- Key commands documented in CLAUDE.md or README
- `.claude/settings.json` present
- Agents defined if project has multiple sub-domains
- Skills present and namespaced
- Context files referenced from CLAUDE.md

Assign a rating: ❌ Not AI-ready / ⚠️ Minimal / ✅ Operational / 🚀 Optimized

### Step 2 — Git Hygiene

Invoke the `orbitant-git-hygiene` skill. It defines the full check list and rating rubric for this section.

Key checks (summary):
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

Invoke the `orbitant-owasp-scan` skill. It defines the full check list and rating rubric for this section. Scope greps to the detected stack (Node.js patterns, Python patterns, or both).

Key checks (summary):
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

### Step 3.5 — Secret history scan

Static grep only catches secrets in tracked files **today**. A secret committed and later removed remains in `git log` and is recoverable by anyone with repo access. This step scans the full history.

Detect whether `gitleaks` is installed:

```bash
command -v gitleaks
```

**If installed** (preferred path): run a redacted scan on the full history:

```bash
gitleaks detect \
  --source . \
  --report-format json \
  --report-path /tmp/gitleaks-${RANDOM}.json \
  --redact \
  --no-banner \
  --exit-code 0
```

Parse the JSON report. For each finding, capture: `RuleID`, `File`, `Commit` (short hash), `Date`, `Author`. Surface findings under Section 3 with this format:

```
- {RuleID} (gitleaks)
  Location: {File} @ {Commit} ({Date}, {Author})
  Finding: secret matched rule "{RuleID}" (value redacted)
  Recommendation: rotate the credential immediately, then purge from history (git filter-repo) and force-push. Rotation is mandatory even if the secret was already removed from the working tree.
```

**Promote ALL gitleaks findings to 🔴 Critical** in the report header. A leaked secret in history is always P0 regardless of how old the commit is.

**If `gitleaks` is NOT installed** (fallback path): run a minimal grep over history. This is shallower and noisier, so the report must say so explicitly.

```bash
# Private keys
git log --all -p -S 'BEGIN PRIVATE KEY' | head -200
git log --all -p -S 'BEGIN OPENSSH PRIVATE KEY' | head -200

# Generic credential assignments with high-entropy values (case-insensitive)
git log --all -p -i -G '(api[_-]?key|secret|token|password)\s*[=:]\s*["\x27]?[A-Za-z0-9_\-]{20,}' | head -500

# Deleted .env files (excluding samples/examples)
git log --all --diff-filter=D --name-only -- '*.env' '*.env.*' \
  | grep -vE '\.(example|sample|template)$' \
  | sort -u
```

Add a note at the top of Section 3:

> ⚠️ Secret history scan was shallow — `gitleaks` not found on PATH. Install with `brew install gitleaks` (macOS) or see <https://github.com/gitleaks/gitleaks> for full coverage.

Even with the fallback, any match must be promoted to 🔴 Critical with rotation guidance.

### Step 4 — 12-Factor

Invoke the `orbitant-12-factor` skill. It defines the full check list and rating rubric for this section. Only statically verifiable factors are scored.

Key checks (summary):
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

{List any P0 findings from git hygiene, OWASP, or secret history scan here, before section breakdowns.
Any gitleaks/fallback finding is automatically P0 — include commit hash and rotation guidance.
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
- Factors I, IV, VI, VII, VIII, IX, XII — see the `orbitant-12-factor` skill for details

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
