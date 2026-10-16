---
name: orbitant-12-factor
description: |
  Use when checking if a repo follows 12-factor app principles — config stored in
  env vars (not hardcoded), dependency lockfiles present, CI pipeline separation,
  structured logging to stdout, or dev/prod environment parity. Activates when
  someone asks about 12-factor compliance, deployment readiness, or config
  management practices in a project of any stack. Also trigger when someone
  notices hardcoded localhost URLs, missing .env.example, or asks "is this
  deploy-ready?" — even without mentioning 12-factor explicitly.
version: "0.2.0"
license: MIT
metadata:
  author: orbitant
  tags: engineering, audit, 12-factor, config, deployment, ci, logging
---

## Overview

Audits the statically-verifiable subset of 12-factor app compliance. Only factors observable from the repo are scored — runtime factors are listed as "not checked" with an explanation.

The audit is defined by the evidence it needs, not by how that evidence is obtained. The repository may be a local checkout, read through an API, or files someone pasted: judge what you can observe, and name what you could not.

---

## When to Use

- Assessing deployment readiness of a new project
- Checking config management practices (hardcoded URLs, missing .env.example)
- Reviewing CI pipeline separation
- Running a section audit after the ground-control audit flagged 12-factor issues

---

## How to Run

1. Read `references/12-factor.md`, in this skill's folder. It defines, for each scored factor, the evidence to look at, what compliance looks like, the fail signals and what to exclude.
2. Identify the stack from the dependency manifests present. It decides which file names and code patterns apply.
3. For each of the five scored factors, gather its evidence and judge it **Passing**, **Failing** or **Not observed**, as the reference defines them. Every scored factor ends in one of the three.
4. Rate the repository with the reference's scoring. With any factor Not observed, the rating is Incomplete, and the report names the evidence that would complete it.

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

### Not observed
- XI. Logs
  Missing: the non-test source and the dependency manifest

### Not checked (requires runtime)
- Factors I, IV, VI, VII, VIII, IX, XII
  Reason: not observable from static repo analysis

Rating: ❔ Incomplete (4/5 observed)
```

Ratings: ❌ Not compliant / ⚠️ Partial / ✅ Good / 🚀 Fully observable compliance / ❔ Incomplete (n/5 observed)

Leave out the "Not observed" section when every scored factor was observed.

See `references/12-factor.md` for full criteria and excluded factors explanation.
