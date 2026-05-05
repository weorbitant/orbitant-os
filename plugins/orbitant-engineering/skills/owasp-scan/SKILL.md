---
name: orbitant-owasp-scan
description: |
  Use when scanning a Node.js or Python repo for OWASP Top 10 vulnerabilities —
  hardcoded secrets, SQL injection patterns, weak cryptography, dangerous functions
  (eval, exec, shell=True), missing security headers, or dependency lockfile issues.
  Activates when someone asks about security posture, wants a static security scan,
  or needs to assess risk before a code review or client engagement.
version: "0.1.0"
license: MIT
metadata:
  author: orbitant
  tags: engineering, audit, security, owasp, vulnerabilities, nodejs, python
---

## Overview

Static security scan for Node.js and Python repos. Finds OWASP Top 10 patterns detectable without running the code. Reports findings with file locations and actionable recommendations.

P0 findings (hardcoded secrets, code injection) surface at the top before any section breakdown.

---

## When to Use

- Before starting work on a client project
- During code review of security-sensitive areas
- Assessing security posture of an unfamiliar repo
- Running a section audit after `/orbitant-engineering:ground-control` flagged OWASP issues

---

## How to Run

Load the reference patterns:

`@plugins/orbitant-engineering/skills/owasp-scan/references/owasp-patterns.md`

Detect the stack first (`package.json` → Node.js, `requirements.txt`/`pyproject.toml` → Python), then apply the relevant patterns. Use grep across source files, excluding test fixtures and `*.example` files.

---

## Output Format

```
## OWASP Security Scan   {rating}

### 🔴 Critical (P0 — fix immediately)
- Possible hardcoded secret
  Location: src/config/db.js:14
  Finding: password = "sup3rs3cr3t"
  Recommendation: move to env var, rotate if exposed

### Passing
- No eval() / exec() usage found
- helmet present in Express app
- Lockfile present (package-lock.json)

### Failing
- SQL injection pattern detected
  Location: src/users/repository.js:42
  Finding: query(`SELECT * FROM users WHERE id = ${userId}`)
  Recommendation: use parameterized queries

Rating: ❌ Critical
```

Ratings: ❌ Critical / ⚠️ Needs work / ✅ Compliant / 🚀 Strong

See `references/owasp-patterns.md` for full pattern list and grep commands.
