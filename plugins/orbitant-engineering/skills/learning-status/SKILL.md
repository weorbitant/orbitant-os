---
name: orbitant-learning-status
description: |
  Use when the user wants a fast status check on their learning without a full report.
  Triggers on: "learning status", "where am I", "what's my learning state", "how's my
  learning going", or "check my progress".
license: MIT
version: "0.1.0"
metadata:
  author: david
  tags: learning, status, progress, quick, overview, streak, backlog
---

## Overview

Read-only, lightweight status display. No AI generation — just read state files and
format them. Instant response.

## When to Use

- Quick check-in before deciding whether to learn today
- Glancing at progress without a full report
- Checking backlog size or current lesson state

## Prerequisites

Profile must exist at `~/.claude/learning/profile.md`. If not, tell the user:
"No learning profile found. Run `/init-learning` to get started."

## Process

### 1. Read State

- `~/.claude/learning/profile.md` — gaps count
- `~/.claude/learning/lessons/current.md` — active lesson (may not exist)
- `~/.claude/learning/backlog.md` — count pending items
- `~/.claude/learning/logs/` — recent logs for streak calculation
- `~/.claude/learning/lessons/archive/` — count completed lessons, scan gap_addressed fields
- `~/.claude/learning/insights.md` — count recurring struggles and confirmed strengths (may not exist)

### 2. Display

Format a concise status block:

```
Learning Status

Current lesson: [topic] — milestone X/Y
  (or: No active lesson)

Last session: [N days ago / today / yesterday]
  (or: No sessions yet)

Backlog: [N] items pending

Streak: [N] sessions this week

Lessons completed: [N] total
Gaps addressed: [N] / [M] from profile
Insights: [N] recurring struggles, [M] confirmed strengths
```

If `insights.md` doesn't exist, show: `Insights: No data yet`

If there are postponed lessons, add:
```
Postponed: [N] lessons (resumable via /learn)
```

### 3. Suggest Action

Based on state, add a one-line suggestion:
- No profile: "Run `/init-learning` to set up your profile."
- No backlog + no current: "Run `/new-learning` to find what to learn next."
- Has backlog but no current: "Run `/learn` to start a lesson."
- Has current lesson: "Run `/learn` to continue where you left off."
- Long time since last session: "It's been a while! Run `/learn` to get back into it."

## Important

- This skill does NO AI generation — it reads files and formats output
- Keep it fast — do not analyze or summarize content, just count and display
- If files are missing, show "No data yet" for that section, not an error
- The streak counts sessions in the current calendar week (Mon-Sun)
