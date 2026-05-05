---
name: orbitant-12-factor
description: |
  Use when checking if a repo follows 12-factor app principles — config stored in
  env vars (not hardcoded), dependency lockfiles present, CI pipeline separation,
  structured logging to stdout, or dev/prod environment parity. Activates when
  someone asks about 12-factor compliance, deployment readiness, or config
  management practices in a Node.js or Python project. Also trigger when someone
  notices hardcoded localhost URLs, missing .env.example, or asks "is this
  deploy-ready?" — even without mentioning 12-factor explicitly.
version: "0.1.0"
license: MIT
metadata:
  author: orbitant
  tags: engineering, audit, 12-factor, config, deployment, ci, logging
---

## Overview

Audits the statically-verifiable subset of 12-factor app compliance. Only factors observable from the repo are scored — runtime factors are listed as "not checked" with an explanation.

---

## When to Use

- Assessing deployment readiness of a new project
- Checking config management practices (hardcoded URLs, missing .env.example)
- Reviewing CI pipeline separation
- Running a section audit after `/orbitant-engineering:ground-control` flagged 12-factor issues

---

## How to Run

Load the reference standards:

`@plugins/orbitant-engineering/skills/12-factor/references/12-factor.md`

Detect the stack first:
```bash
ls package.json requirements.txt pyproject.toml 2>/dev/null
```

Then run checks for all statically-verifiable factors. Note which factors were skipped and why.

---

## Output Format

```
## 12-Factor Compliance   {rating}

### Passing
- II. Dependencies: lockfile present (package-lock.json), versions pinned
- V. Build/release/run: CI pipeline defined (.github/workflows/)

### Failing
- III. Config: hardcoded URLs found in source
  Finding: "http://localhost:3000" in src/api/client.js:8
  Recommendation: move to process.env.API_URL, add to .env.example

### Not checked (requires runtime)
- Factors I, IV, VI, VII, VIII, IX, XII
  Reason: not observable from static repo analysis

Rating: ⚠️ Partial
```

Ratings: ❌ Not compliant / ⚠️ Partial / ✅ Good / 🚀 Fully observable compliance

See `references/12-factor.md` for full criteria and excluded factors explanation.
