---
name: orbitant-learning-insights
description: |
  Internal-only skill — never called directly by users. Provides the Learning
  Intelligence Layer. Two modes: "build context" (called by /learn at session start)
  reads learning history and produces a learner context; "update insights" (called by
  /end-learn after session close) updates the persistent insights.md summary.
license: MIT
version: "0.1.0"
metadata:
  author: david
  tags: learning, insights, intelligence, patterns, review, difficulty, internal
---

## Overview

Centralized intelligence layer that mines past session data to improve current
learning sessions. Not user-facing — invoked by `/learn` and `/end-learn` only.

## Mode 1: Build Context

Called by `/learn` at session start, before content delivery.

### What to Read

1. `~/.claude/learning/insights.md` — persistent summary (may not exist yet)
2. `~/.claude/learning/lessons/archive/` — scan all archived lessons for:
   - `## Still Fuzzy On` sections
   - `## Key Learnings` sections
   - `status` frontmatter (completed / postponed / abandoned)
   - `sessions` count vs milestone count (was the lesson harder than estimated?)
3. `~/.claude/learning/logs/` — scan recent session logs (last 30 days) for:
   - `## Struggled With` sections
   - `## Still Fuzzy On` sections
   - `## Key Learnings` sections

### What to Produce

Return a learner context to the calling skill (kept in conversation, not written to disk):

**fuzzy_topics:**
Themes that appear in "Still Fuzzy On" across archived lessons or recent logs.
Include the source lesson and how recently it was seen.
Example:
- "async error handling" — from LangChain lesson, 2 sessions ago
- "state persistence" — from LangGraph lesson, last week

**difficulty_adjustment:**
Per-gap difficulty level based on performance patterns:
- `beginner` — struggled with basics, needed many hints
- `intermediate` — completed milestones with some help, some fuzzy areas remain
- `advanced` — nailed milestones consistently, few or no struggles

Derive this from: nailed-it vs struggle ratio, sessions-taken vs sessions-estimated,
and whether fuzzy topics persist or get resolved across lessons.

**cross_topic_patterns:**
Themes that appear as struggles across two or more different lesson topics.
Example: "async patterns" struggled in both LangChain and LangGraph lessons.

### Graceful Handling

- If `insights.md` does not exist: skip it, derive what you can from archive and logs
- If archive and logs are empty (new user): return empty context, no errors
- If no patterns are detected: return empty context — don't manufacture insights

## Mode 2: Update Insights

Called by `/end-learn` after the session log and lesson state have been written.

### Input

The session's observations from the current conversation:
- Struggles (from the debrief's "Struggled with" section)
- Key learnings (from "Key learnings" section)
- Still fuzzy topics (from "Still fuzzy on" section)
- Hints given during the session

### Process

1. Read `~/.claude/learning/insights.md` (create it if it doesn't exist)
2. For each struggle theme from this session:
   - If it already exists in `## Recurring Struggles`: increment session count, update last-seen date
   - If it's new: add it with count 1
3. For each key learning from this session:
   - If the theme exists in `## Recurring Struggles` AND the user demonstrated
     clear understanding (nailed it, no hints needed): move it to `## Confirmed Strengths`
   - Otherwise: leave struggles as-is (one good session doesn't confirm mastery)
4. Update `## Difficulty Trend`:
   - Look at the gap addressed by the current lesson
   - If the session had mostly nailed-it observations: trend toward advanced
   - If the session had significant struggles: trend toward beginner
   - Use the overall pattern across sessions, not just this one session
5. If any incidental code observations were noted during the session,
   add them to `## Incidental Notes` with the lesson topic and date
6. Update `last_updated` in frontmatter

### User Notification

After updating, show the user a one-liner ONLY if something meaningful changed:
- A theme moved to confirmed strength: "Insight updated: [theme] moved to confirmed strength"
- A new recurring pattern detected (3+ sessions): "Pattern detected: [theme] has come up in N sessions now"
- Difficulty level changed for a gap: "Difficulty updated: [gap] progressed to [level]"

If nothing meaningful changed (just incremented a count, added a new single-occurrence
struggle), say nothing — don't create noise.

## Important

- This skill is NEVER called directly by users — only by `/learn` and `/end-learn`
- Build Context mode is READ-ONLY — it produces conversation context, writes nothing
- Update Insights mode writes ONLY to `insights.md` — no other files
- Do not read the repo — repo analysis is handled by `/learn` step 3.5
- Be conservative with "confirmed strength" promotion — require evidence across
  multiple sessions, not just one good moment
- Do not manufacture patterns from thin data — if there's only one session logged,
  there are no cross-topic patterns to report
