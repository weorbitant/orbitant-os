---
name: orbitant-learning-report
description: |
  Use when the user wants to review what they've learned, see progress on their gaps,
  get a summary of recent learning sessions, or wants article ideas based on learnings.
  Triggers on: "learning report", "what have I learned", "progress report", "summarize
  my learning", or "learning summary for the last month".
license: MIT
version: "0.1.0"
metadata:
  author: david
  tags: learning, report, progress, summary, review, growth, gaps, articles
---

## Overview

Aggregate learning logs, archived lessons, and profile data into a progress report
over a given timeframe. Highlight growth, identify patterns, and suggest next steps.

## When to Use

- User wants to see what they've learned recently
- Periodic self-review (weekly, biweekly, monthly)
- Preparing for a 1:1 or performance review
- Looking for article ideas based on recent learnings

## Prerequisites

Profile must exist at `~/.claude/learning/profile.md`. At least one session log
should exist in `~/.claude/learning/logs/` for the report to be meaningful.

## Process

### 1. Parse Timeframe

Accept an argument for the timeframe. Default: 2 weeks.

Supported formats:
- `2w` — 2 weeks
- `1m` — 1 month
- `3d` — 3 days
- No argument — default to `2w`

Calculate the start date from today minus the timeframe.

### 2. Read Data

- `~/.claude/learning/profile.md` — gaps for comparison
- `~/.claude/learning/logs/` — all session logs within the timeframe
- `~/.claude/learning/lessons/archive/` — lessons closed within the timeframe
- `~/.claude/learning/lessons/current.md` — active lesson (if any)
- `~/.claude/learning/insights.md` — learning intelligence data (may not exist)

### 3. Generate Report

Structure the report with these sections:

### Summary
- Number of sessions in the period
- Approximate total time invested (sum of `duration_approx` from logs)
- Lessons completed / postponed / abandoned / in progress

### Topics Covered
- List each topic worked on with milestone progress

### Key Learnings
- Aggregate and deduplicate learnings across all session logs
- Group by topic for readability

### Recurring Struggles
- Themes that appear in "Struggled With" or "Still Fuzzy On" across multiple sessions
- These are the areas that need more attention

### Gap Progress
- Compare profile gaps against lessons completed and learnings gathered
- Which gaps have been addressed? Which are untouched?

### Patterns
- Abandoned/postponed patterns (if any): "You postponed 2 frontend lessons — is frontend still a priority?"
- Session frequency: "You averaged 3 sessions/week"
- Style preferences observed

**Learning Intelligence** (only if insights.md exists)
- Strengths confirmed during this period
- Recurring struggles with session counts
- Difficulty progression for each gap (beginner → intermediate → advanced)
- Any incidental notes logged during the period

### Suggested Next Steps
- Recommend topics to revisit based on "still fuzzy" themes
- Suggest gaps to tackle next
- Optionally: propose article ideas based on what the user learned well enough to teach

Example output:
```
# Learning Report — Mar 17 to Mar 31, 2026

## Summary
- **Sessions:** 6 sessions over 2 weeks
- **Time invested:** ~9 hours
- **Lessons:** 1 completed, 1 in progress

## Topics Covered
- React Dashboard (completed) — 4/4 milestones
- GraphQL API Design (in progress) — 1/3 milestones

## Key Learnings
**React:**
- Components are functions returning JSX; state drives re-renders
- useEffect cleanup prevents memory leaks on unmount

**GraphQL:**
- Schema-first design prevents client/server drift

## Recurring Struggles
- State management patterns (came up in 3 sessions)
- Async error handling (2 sessions)

## Gap Progress
- Frontend: addressed (React dashboard completed)
- Backend APIs: in progress (GraphQL)
- Infrastructure: untouched

## Learning Intelligence
- **Confirmed strengths:** LCEL chain composition, prompt templating
- **Recurring struggles:** async error handling (4 sessions), state management (3 sessions)
- **Difficulty progression:** backend APIs: intermediate → advanced, AI/orchestration: beginner → intermediate

## Suggested Next Steps
- Revisit state management — still fuzzy after multiple sessions
- Continue GraphQL lesson (1 milestone left this week)
- Consider starting an infrastructure topic next
```

### 4. Save Report

Write to `~/.claude/learning/reports/YYYY-MM-DD-<period>.md`
- Example: `2026-03-31-2w.md`

### 5. Display

Show the full report to the user in the conversation. Mention where it was saved.

## Important

- If no logs exist for the timeframe, tell the user and suggest a different range
- Deduplicate learnings — the same insight may appear in multiple session logs
- The "article ideas" section is optional — only include if the user has substantial learnings
- Keep the tone encouraging — highlight growth, not just gaps
