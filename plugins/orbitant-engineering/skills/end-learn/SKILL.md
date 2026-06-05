---
name: orbitant-end-learn
description: |
  Use when the user is done learning for the day, wants to save progress, or wants to
  wrap up a lesson. Also triggered by /learn when postponing or abandoning. Updates the
  learning intelligence layer (insights.md) after each session. Triggers on: "end session",
  "done learning", "save progress", "wrap up", "end-learn", "I'm done for today".
license: MIT
version: "0.1.0"
metadata:
  author: david
  tags: learning, session, log, debrief, observations, progress, wrap-up
---

## Overview

Close a learning session by synthesizing Claude's silent observations into a debrief
the user reviews. Write the session log, update lesson state, and archive completed
lessons.

## When to Use

- User finishes a learning session
- User wants to save progress and stop
- Called by `/learn` when postponing or abandoning a lesson

## Prerequisites

There must be an active lesson at `~/.claude/learning/lessons/current.md`. If not,
tell the user: "No active lesson found. Nothing to close."

## Process

### 1. Read State

- `~/.claude/learning/lessons/current.md` — current lesson state
- Session observations from the current conversation (hints given, struggles, successes)

### 2. Present Draft Debrief

Synthesize observations into a structured draft. Use this exact format:

```
Here's what I noticed this session:

**What you worked on**
- [summary of milestone(s) attempted and outcomes]

**Key learnings**
- [things the user demonstrated understanding of]
- [concepts that "clicked" based on observed aha moments]

**Struggled with**
- [areas where hints were needed]
- [repeated mistakes or confusion points]

**Still fuzzy on**
- [unresolved questions]
- [topics where understanding seemed incomplete]
```

If a section is empty (e.g., no struggles), include it with "Nothing notable — solid session!" rather than omitting it.

Ask: "**Edit anything, add something I missed, or looks good?**"

Wait for the user to confirm or make edits. Do NOT proceed until the user responds.

### 3. Determine Lesson Status

**If all milestones are completed:**
- Congratulate the user
- Status: `completed`

**If not all milestones are done:**
- Ask: "What should we do with this lesson?"
  - **Continue next time** — keep as `current.md`, no archive
  - **Postpone** — archive with `status: postponed`
  - **Abandon** — ask for a brief reason, archive with `status: abandoned`

### 4. Write Session Log

Write to `~/.claude/learning/logs/YYYY-MM-DD.md`:
- If the file already exists (same-day session), use suffix: `YYYY-MM-DD-2.md`, `YYYY-MM-DD-3.md`, etc.
- Use the session log format from `${CLAUDE_PLUGIN_ROOT}/skills/learning-data-spec.md`
- Content comes from the confirmed debrief

### 5. Update Lesson State

**If continuing next time:**
- Update `milestones_completed` in `current.md` frontmatter
- Mark completed milestones as `[x]` in the milestones list
- Append a session log entry to `current.md`:
  ```
  ### Session N — YYYY-MM-DD
  - Completed: [milestones]
  - Struggled with: [summary]
  - Next: [what to tackle next]
  ```

**If completed:**
- Move `current.md` to `lessons/archive/YYYY-MM-DD-<topic-slug>.md`
- Set frontmatter: `status: completed`, `closed: YYYY-MM-DD`, `sessions: N`
- Add `## Key Learnings` and `## Still Fuzzy On` sections from accumulated observations
- Mark the corresponding backlog item as `[x]` done in `backlog.md`
- Delete `current.md`

**If postponed:**
- Move `current.md` to `lessons/archive/YYYY-MM-DD-<topic-slug>.md`
- Set frontmatter: `status: postponed`, `closed: YYYY-MM-DD`
- Preserve all milestone progress and session logs
- Delete `current.md`

**If abandoned:**
- Move `current.md` to `lessons/archive/YYYY-MM-DD-<topic-slug>.md`
- Set frontmatter: `status: abandoned`, `closed: YYYY-MM-DD`, `abandoned_reason: <reason>`
- Preserve all milestone progress and session logs
- Delete `current.md`

### 5.5. Update Insights

Invoke the `learning-insights` skill in "update insights" mode.

Pass the session's observations from the confirmed debrief:
- Struggles (from "Struggled with" section)
- Key learnings (from "Key learnings" section)
- Still fuzzy topics (from "Still fuzzy on" section)
- Hints given during the session (from silent observation tracking)
- Any incidental code observations noted during the session

The `learning-insights` skill will:
1. Update `~/.claude/learning/insights.md` (create it if first time)
2. Return a one-liner if something meaningful changed

If a one-liner is returned, show it to the user before the confirmation message in step 6.
Examples:
- "Insight updated: LCEL chain composition moved to confirmed strength"
- "Pattern detected: state management has come up in 3 sessions now"

If nothing meaningful changed, say nothing — proceed to step 6 silently.

### 6. Confirm

Tell the user what was saved:
- "Session log saved to `logs/YYYY-MM-DD.md`"
- If archived: "Lesson archived as [status] to `lessons/archive/[filename]`"
- If continuing: "Progress saved. Run `/learn` next time to continue from milestone X."

## Important

- Always present the debrief and get user confirmation BEFORE writing any files
- Observations come from the current conversation — if `/end-learn` is called in a new
  conversation (without a preceding `/learn`), ask the user to describe what they did
- Create directories if they don't exist (`logs/`, `lessons/archive/`)
- The slug for archive filenames: lowercase, hyphens, max 50 chars (e.g., "react-dashboard-api-metrics")
