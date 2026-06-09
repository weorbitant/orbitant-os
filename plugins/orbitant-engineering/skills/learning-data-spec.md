# Learning Data Spec

Shared data format for the learning skill suite. All skills read/write
from `~/.claude/learning/` using these formats.

## Directory Structure

~/.claude/learning/
  profile.md              # Learner profile (init-learning)
  backlog.md              # Learning ideas queue (new-learning)
  insights.md             # Learning intelligence summary (learning-insights)
  lessons/
    current.md            # Active lesson, one at a time (learn)
    archive/
      YYYY-MM-DD-topic-slug.md  # Closed lessons (end-learn)
  logs/
    YYYY-MM-DD.md         # Session logs (end-learn)
    YYYY-MM-DD-2.md       # Same-day collision: append suffix
  reports/
    YYYY-MM-DD-period.md  # Generated reports (learning-report)

## File Formats

### profile.md

Frontmatter:
- name: string
- role: string
- created: YYYY-MM-DD
- last_updated: YYYY-MM-DD
- learning_style: guided | challenge-based | reading | adaptive
- session_length: 30m | 60m | 90m | 120m

Body sections: ## Strengths, ## Gaps, ## Goals, ## Feedback
Each section contains a bullet list.

### backlog.md

Body section: ## Backlog
Each item is a checkbox line:
- [ ] <title> — **gap:** <gap> — **effort:** <N sessions> — **style:** <hands-on | reading>
Completed items: - [x] ~~<title>~~ — completed YYYY-MM-DD

### current.md (active lesson)

Frontmatter:
- topic: string
- status: in_progress
- started: YYYY-MM-DD
- style: guided | challenge-based | reading
- session_length: from profile
- project_path: local path (if hands-on, optional)
- project_repo: remote URL (optional)
- milestones_total: number
- milestones_completed: number

Body sections:
- ## Milestones — checkbox list
- ## Session Log — subsections per session with observations

### Archived lesson

Filename: YYYY-MM-DD-<topic-slug>.md (slug: lowercase, hyphens, max 50 chars)

Frontmatter (extends current.md):
- status: completed | postponed | abandoned
- closed: YYYY-MM-DD
- abandoned_reason: string (only if abandoned)
- sessions: number
- gap_addressed: string

Body sections (extends current.md):
- ## Key Learnings — bullet list
- ## Still Fuzzy On — bullet list

### Session log (logs/YYYY-MM-DD.md)

Frontmatter:
- date: YYYY-MM-DD
- lesson: string (topic)
- milestone_worked_on: number
- session_number: number
- duration_approx: string (e.g. "90m")

Body sections:
- ## What I Worked On
- ## Key Learnings
- ## Struggled With
- ## Still Fuzzy On
- ## Next Steps

### insights.md

Managed by the `learning-insights` skill. Created automatically on the first
`/end-learn` after the enhancement — no manual setup needed.

Frontmatter:
- last_updated: YYYY-MM-DD

Body sections:
- ## Recurring Struggles — bullet list: `<theme> (N sessions, N topics) — last seen YYYY-MM-DD`
- ## Confirmed Strengths — bullet list: `<theme> — confirmed across N sessions`
- ## Difficulty Trend — bullet list: `<gap>: beginner | intermediate | advanced`
- ## Incidental Notes — bullet list: `<brief observation> — source: <lesson topic> YYYY-MM-DD`

## Conventions

- All dates use ISO format: YYYY-MM-DD
- Skills MUST check if profile.md exists before proceeding; prompt to run /init-learning if not
- Skills create missing directories on first write
- Skills preserve existing content when updating (append to backlog, update frontmatter)
- Same-day log collision: check if YYYY-MM-DD.md exists, append -2, -3, etc.
- Skills that read insights.md MUST handle the case where it doesn't exist — skip intelligence features silently, no errors, no "run X first" messages
- insights.md is created automatically on the first /end-learn — no migration or manual setup needed
