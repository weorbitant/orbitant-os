---
name: orbitant-learn
description: |
  Use when the user wants to sit down and learn, continue a lesson, practice a skill,
  or work through a learning project. Triggers on: "let's learn", "continue my lesson",
  "start learning", "practice", "I have time to learn", or "pick up where I left off".
license: MIT
version: "0.1.0"
metadata:
  author: david
  tags: learning, session, lesson, practice, teaching, milestones, hands-on, reading
---

## Overview

The core learning experience. Start a new lesson from the backlog, resume the current
one, or pick up a postponed lesson. Deliver content adapted to the user's chosen style,
track observations silently, and pace to the user's session length.

## When to Use

- User wants to start a learning session
- User wants to continue where they left off
- User has free time and wants to learn

## Prerequisites

Profile must exist at `~/.claude/learning/profile.md`. If not, tell the user:
"No learning profile found. Run `/init-learning` first to set up your profile."

## Process

### 1. Load State

Read these files:
- `~/.claude/learning/profile.md` — style preference, session_length
- `~/.claude/learning/lessons/current.md` — active lesson (may not exist)
- `~/.claude/learning/backlog.md` — available items
- Scan `~/.claude/learning/lessons/archive/` for lessons with `status: postponed`

### 2. Route

**If current lesson exists (`current.md` is present):**
- Show: "You have an active lesson: **[topic]** — milestone X/Y. Last session: [date]."
- Options: **Continue** / **Postpone** / **Abandon**
- If Postpone or Abandon: trigger the `/end-learn` closing flow (ask reason if abandoning), then proceed to "no current lesson" flow below

**If no current lesson:**
- List postponed lessons (if any): "You have postponed lessons you can resume:"
- List backlog items: "Your backlog:"
- User picks one
- If postponed lesson picked: move it from `archive/` back to `lessons/current.md`, resume from last milestone
- If backlog item picked: expand into a full lesson — generate milestones fitted to session_length, create `lessons/current.md`

### 2.5. Build Learner Context

Invoke the `learning-insights` skill in "build context" mode. It reads archived lessons,
session logs, and `insights.md` to produce a learner context.

**If fuzzy_topics found**, flag them to the user:
"Before we start — these came up as fuzzy in past sessions:
- [topic] (from [lesson], [timeframe ago])
- [topic] (from [lesson], [timeframe ago])
Want to spend a few minutes on any of these, or dive in?"

Wait for the user's choice. If they want to review, spend a few minutes on the topic
(a quick question or explanation), then proceed to the lesson. If they want to dive in, proceed.

**If cross_topic_patterns found**, mention briefly:
"Heads up: I've noticed [theme] keeps coming up across different topics. I'll keep
an eye on that today."

This is informational only — do not wait for a response, proceed to Session Start.

**Difficulty adjustment** feeds into milestone generation in step 4:
- If the trend says "advanced" for this gap: skip beginner scaffolding, present harder challenges
- If "beginner": provide more guidance, smaller steps
- If no data yet: use default difficulty (intermediate)

### 3. Session Start

Ask: "**Hands-on or reading today?**" (show the default from profile, user can override)

If hands-on, also ask: "**Where should we create the project?**" (suggest a path, user confirms)
- Record `project_path` in `current.md`

### 4. Deliver Content

Adapt to the chosen style for this session:

**Challenge-based:**
- Present the milestone as a problem statement with clear success criteria
- Let the user work — do not write the solution
- Give hints only when the user asks or is clearly stuck
- Review the user's code/work, point out issues, suggest improvements
- When the milestone is met, confirm and move to the next

Example challenge prompt:
```
**Milestone 2: Fetch real API data**

Your task: Replace the mock data with real API calls.

**Success criteria:**
- App fetches data from the /api/metrics endpoint on mount
- Shows a loading spinner while fetching
- Displays an error message if the request fails
- Table renders with real data on success

**Hints available** — just ask if you get stuck. Try it yourself first!
```

**Guided:**
- Walk through the milestone step by step
- Explain concepts as you go — WHY, not just how
- Write some code, then ask the user to write the next piece
- More scaffolding than challenge-based, but still ask the user to do the work
- After each step, check understanding: "Makes sense? Any questions before we move on?"

**Reading:**
- Curate relevant articles, documentation, or book chapters (use web search for up-to-date content)
- Explain key concepts in your own words — concise, not lecture-style
- After each concept block, ask a comprehension question to test understanding
- Propose thought exercises (no coding required)
- This mode works on mobile — keep responses readable, use short paragraphs, avoid code blocks when possible

### 5. Silent Observation Tracking

Throughout the session, **silently** track these observations (do NOT show them to the user during the session — they are for `/end-learn`):

- **Hints given**: what the user asked for help with, and what hint you provided
- **Struggles**: where the user got stuck, made repeated mistakes, or needed multiple attempts
- **Nailed it**: things the user got right on the first try
- **Aha moments**: when the user demonstrated sudden understanding
- **Questions asked**: what the user was curious about

Keep these observations in your conversation context as a mental running list. They will be synthesized by `/end-learn`. Do NOT write them to any file during the session.

Example internal observation (never shown to user):
```
Observation: Hint given — user confused useState return value, explained it's [value, setter].
Observation: Nailed it — destructuring props on first try without help.
Observation: Struggle — tried to mutate state directly 3 times before understanding immutability.
```

### 6. Time Awareness

- Track approximate elapsed time based on conversation flow
- When approaching the user's `session_length`: "You're at about **~Xm** — good stopping point after this exercise, or keep going?"
- Never cut the user off — always let them choose to continue
- If a milestone completes near the time limit, suggest ending: "Milestone done! Great stopping point."

### 7. Session End

When the user wants to stop (or you suggest stopping and they agree):
- Tell the user: "Run `/end-learn` to save your progress and capture what you learned."
- Do NOT write files yourself — `/end-learn` handles all persistence

## Milestone Design (when expanding from backlog)

When creating a new lesson from a backlog item:
- Each milestone should be completable in one session (user's `session_length`)
- Milestones build on each other — each one produces a visible, testable result
- First milestone is always the simplest — get something working immediately
- Last milestone adds polish or advanced features
- For reading lessons: milestones are topic chunks, not code deliverables

## Important

- ONE lesson at a time — never create a second `current.md`
- Observation tracking is SILENT — do not show the user your notes mid-session
- Respect the user's style choice — do not switch styles mid-session unless asked
- If the backlog is empty and no lessons exist, suggest running `/new-learning`
- Preserve `current.md` session log between sessions — append, don't overwrite
