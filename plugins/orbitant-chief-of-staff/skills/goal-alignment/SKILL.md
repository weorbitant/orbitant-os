---
name: orbitant-goal-alignment
description: |
  Scores and prioritizes any item — emails, tasks, meetings, calendar blocks, decisions,
  opportunities — against the user's quarterly rocks defined in rocks.yaml. Activates during
  email triage, task ranking, meeting prep, weekly planning, daily briefings, and scheduling
  decisions. Use this skill whenever prioritization is needed, whenever something must be
  ranked or compared against strategic objectives, or whenever the user is deciding how to
  spend their time — even if they don't explicitly mention "goals" or "rocks". Also activates
  when detecting drift: if the user's calendar or task list is misaligned with their stated
  priorities, proactively flag it. Even if the user just asks "should I take this meeting?"
  or "is this worth my time?", apply goal alignment scoring.
version: "1.0.0"
license: MIT
user-invocable: false
metadata:
  author: orbitant
  tags: chief-of-staff, goals, prioritization, rocks, alignment, scoring
---

## Overview

This skill scores any work item against the user's quarterly rocks (strategic objectives) defined in `rocks.yaml`. Each item receives a weighted alignment score from 0.0 to 1.0, with a rationale explaining which rocks it advances and why. When patterns of misalignment emerge — time drifting toward low-leverage work, calendar not matching rock weights — the skill pushes back constructively to protect the user's strategic focus.

## When This Skill Activates

This skill is called as a subroutine during any prioritization workflow:

- **`/triage`** — scoring inbound emails by strategic relevance
- **`/today`** — ranking today's tasks and calendar by alignment
- **`/week`** — evaluating the weekly plan against rock weights
- **`/prep`** — assessing meeting value before the user walks in
- **Ad-hoc decisions** — "should I take this call?", "is this task worth doing?"

It does NOT run standalone. Other commands and skills invoke it when they need alignment data.

## Loading Rocks

### Lookup Order

1. `./rocks.yaml` (project root)
2. `~/.claude/rocks.yaml` (global)

Use the first file found. Parse the YAML and extract:
- `quarter` — the active quarter label
- `rocks[]` — each rock with `name`, `weight`, and `key_results[]`

### If rocks.yaml Is Not Found

Do NOT block the calling command. Instead:
1. Skip all scoring logic
2. Return a warning to the calling command: "Goal alignment scoring is disabled — no rocks.yaml found."
3. Suggest setup: "Create `~/.claude/rocks.yaml` with your quarterly rocks to enable prioritization. See rocks.example.yaml for the format."
4. The calling command should continue without alignment data.

### Validation

- Weights across all rocks should sum to ~1.0 (warn if they differ by more than 0.05)
- Each rock must have at least a `name` and `weight`
- Missing `key_results` is acceptable — score against the rock name/theme instead

## Scoring Algorithm

For each item being scored (email, task, meeting, decision):

### Step 1: Assess Alignment Per Rock

For each rock, determine an alignment score on a 0–1 scale:

| Score | Meaning |
|-------|---------|
| 0.0   | Completely unrelated to this rock |
| 0.25  | Loosely related — same domain but no direct impact |
| 0.5   | Tangentially related — supports but doesn't directly advance a key result |
| 0.75  | Strongly related — clearly advances the rock's theme |
| 1.0   | Directly advances a specific key result |

### Step 2: Calculate Weighted Score

```
final_score = Σ (alignment_i × weight_i) for each rock_i
```

The result is a value between 0.0 and 1.0.

### Step 3: Categorize

| Category | Range | Meaning |
|----------|-------|---------|
| **HIGH** | > 0.7 | Directly advances top priorities |
| **MEDIUM** | 0.3 – 0.7 | Supports priorities or has indirect value |
| **LOW** | < 0.3 | Minimal strategic value |

### Step 4: Provide Rationale

Always explain the score. Name the rock(s) that drive it and why. Never present a bare number without context.

## Pushback Behavior

Push back when patterns indicate strategic drift. Be constructive, not nagging.

### Triggers

1. **Time drift** — More than 50% of the user's time (tasks or calendar) is going to LOW-alignment items. Flag: "Based on your stated priorities, over half your time today is on low-alignment work."

2. **Weight mismatch** — A high-weight rock is getting disproportionately little time. Example: a rock with 0.35 weight getting less than 15% of scheduled time. Flag: "Revenue Acceleration carries 35% weight but only 10% of your calendar this week."

3. **Low-value commitment** — The user is about to spend significant time on a LOW item. Suggest: "This scores LOW (0.18) against your rocks. Consider deferring or delegating."

### Rules for Pushback

- Frame as: "Based on your stated priorities..." — never "you should" or "you're wrong"
- Push back **maximum once per session** on the same drift pattern — don't nag
- If the user acknowledges and proceeds, respect the decision silently
- Scoring is **advisory, not prescriptive** — the user always has the final call

## Output Format

When presenting alignment scores, use this format:

```
📊 Goal Alignment: {CATEGORY} ({score})
└─ {Rock Name} ({weight}w): {alignment} — {one-line rationale}
└─ {Rock Name} ({weight}w): {alignment} — {one-line rationale}
└─ {Rock Name} ({weight}w): {alignment} — {one-line rationale}
└─ {Rock Name} ({weight}w): {alignment} — {one-line rationale}
```

Example:

```
📊 Goal Alignment: HIGH (0.82)
└─ Revenue Acceleration (0.35w): 0.9 — directly advances "close enterprise contracts"
└─ Platform GA (0.30w): 0.7 — unblocks beta partner onboarding
└─ Team & Culture (0.20w): 0.0
└─ Partnerships (0.15w): 0.0
```

For batch scoring (e.g., triage lists), show the abbreviated inline format:

```
[HIGH 0.82] Email subject or task name
[MED  0.45] Another item
[LOW  0.12] Low-priority item
```

Calling commands may reformat this output to fit their own layout.

## Cowork Adaptation

If `rocks.yaml` is not found on the filesystem but the user has shared their rocks in the conversation context (pasted text, linked doc, prior discussion), extract and use that data. Apply the exact same scoring algorithm. Note in the output that scoring is based on conversation context rather than `rocks.yaml`.

## Key Rules

1. **Never block a command** when `rocks.yaml` is missing — skip scoring and let the command proceed
2. **Always show rationale**, not just numbers — explain which rock and why
3. **Don't nag** — push back max once per session on the same drift pattern
4. **Scoring is advisory** — the user always decides; never override their judgment
5. **Respect weights** — a 0.35-weight rock matters more than a 0.15-weight rock in every calculation
6. **Be honest about uncertainty** — if alignment is ambiguous, say so and score conservatively
7. **No hallucinated rocks** — only score against rocks actually defined in the user's file or context
