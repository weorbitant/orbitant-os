---
name: status
description: |
  Operational health dashboard for the chief-of-staff plugin. Shows system
  state including stale contacts, overdue tasks, goal progress, calendar
  alignment, and recent activity across connected services. Run daily or
  as needed to stay on top of your operating rhythm. Unlike /preflight
  (setup validation), /status shows ongoing operational health.
---

## Overview

This command generates a read-only operational dashboard summarizing health across all connected systems. It is designed for daily use — run it each morning or whenever you need a quick pulse check on goals, contacts, calendar, and tasks. Where `/preflight` validates that the system is correctly set up, `/status` reports on the ongoing state of the things you are managing.

## Execution Flow

1. **Invoke `orbitant-graceful-degradation`** to determine which MCP servers and config files are available. This MUST run first — do not skip it, even if you believe everything is connected.
2. **Build each dashboard section independently** using the availability report. If a data source is missing, print the fallback message for that section and continue to the next. One failing source never blocks the rest of the dashboard.
3. **Render the final output** using the format specified below. Timestamp the report and include the `/preflight` hint at the bottom.

## Dashboard Sections

Build each section in order. Use the availability report from graceful-degradation to decide which sections can populate with live data and which show fallback messages.

### 1. Config Status

Summarize which configuration files are loaded. Pull details from the files themselves when available.

| Config | When loaded | What to show |
|--------|-------------|--------------|
| rocks.yaml | Found | Quarter, number of rocks (e.g., "Q2-2026, 4 rocks loaded") |
| rocks.yaml | Missing | "missing — create rocks.yaml to enable goal tracking" |
| voice.md | Found | "loaded" |
| voice.md | Missing | "missing — copy from references/voice.example.md" |
| constraints.yaml | Found | Timezone value (e.g., "America/New_York") |
| constraints.yaml | Missing | "missing — copy from references/constraints.example.yaml" |
| contacts/ | Found | File count and stale count (e.g., "12 files (3 stale)") |
| contacts/ | Missing | "no contact files found — see crm/contact.example.md" |

### 2. Goal Progress

**Requires**: rocks.yaml

For each rock in `rocks.yaml`:
- Compute an overall progress by averaging the `progress` values of its key results.
- Render a 10-segment progress bar using `■` for filled and `□` for empty segments.
- Append the rock name, percentage (rounded to nearest integer), and status.
- If status is `at_risk`, append `-- at risk` with a warning indicator. If `off_track`, append `-- off track` with alert indicator.

**Fallback** (rocks.yaml missing): Print "Goal tracking disabled -- create rocks.yaml to enable."

### 3. Contact Health

**Requires**: contacts/*.md files

Scan every `.md` file in `contacts/`. For each contact, parse the YAML frontmatter and compute staleness:

- A contact is **stale** when: `today - last_interaction > staleness_days`
- Sort stale contacts by tier (Tier 1 first), then by days overdue (most overdue first).
- Show total contacts, healthy count, and stale count in a summary line.
- List each stale contact with tier, name, days since last contact, and their staleness threshold.
- Use severity indicators: red for Tier 1 stale, yellow for Tier 2/3 stale.

**Fallback** (no contacts): Print "No contact files found -- see crm/contact.example.md."

### 4. Calendar Load

**Requires**: Google Calendar MCP (`mcp__calendar__list_events`)

Pull today's events and compute:
- **Meeting count** vs `max_per_day` from constraints.yaml (default to 5 if constraints missing).
- **Hard stop conflicts**: Check each meeting's end time against `hard_stops` from constraints.yaml. Flag any meeting that overlaps or cuts too close (within `buffer_between` minutes).
- **Focus time**: Calculate total non-meeting time during work hours. Work hours come from constraints.yaml (default 09:00-18:00).

**Fallback** (Calendar unavailable): Print "Calendar data unavailable -- connect Google Calendar MCP."

### 5. Task Summary

**Requires**: Asana MCP (`mcp__asana__asana_search_tasks`)

Query tasks assigned to the current user:
- Count tasks due today, due this week, and overdue.
- Present as a single summary line.

**Fallback** (Asana unavailable): Print "Task data unavailable -- connect Asana MCP."

## Output Format

Render the dashboard using this structure. Adapt content based on actual data — the example below is illustrative.

```
# Chief of Staff -- Status Dashboard

## Config
- rocks.yaml: Q2-2026, 4 rocks loaded
- voice.md: loaded
- constraints.yaml: America/New_York
- contacts: 12 files (3 stale)

## Goal Progress
[■■■■■■■□□□] Revenue Acceleration (35%) -- on track
[■■■■■□□□□□] Platform GA Launch (50%) -- at risk
[■■■■□□□□□□] Team & Culture (40%) -- on track
[■■■□□□□□□□] Strategic Partnerships (30%) -- on track

## Contact Health
12 contacts total | 9 healthy | 3 stale
  Jane Smith (Tier 1) -- last contact 21 days ago (threshold: 7 days)
  Carlos Vega (Tier 2) -- last contact 18 days ago (threshold: 14 days)
  Sarah Chen (Tier 3) -- last contact 35 days ago (threshold: 30 days)

## Calendar (Today)
4 meetings (max: 5) | 3.5h focus time available
  16:00 meeting conflicts with "School pickup" hard stop buffer

## Tasks
3 due today | 2 overdue | 8 due this week

---
Last checked: 2026-02-25 09:15 AM
Run /orbitant-chief-of-staff:preflight to verify system setup
```

Keep the output scannable. No paragraphs of prose — use short lines, counts, and indicators.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Config checks**: Instead of reading files from disk, check whether rocks, voice, constraints, or contact data has been pasted into the conversation context. Mark filesystem configs as "not checked (Cowork mode)" if you cannot verify them.
- **MCP sections**: Work identically — the same MCP tool calls are available in Cowork.
- **Contact health**: If contact data was provided in conversation context rather than files, parse it from there. Otherwise skip the section with a Cowork-specific fallback message.

## Key Rules

1. **Each section is independent.** One failing source does not block others. Always render every section.
2. **Use graceful-degradation output** to decide which sections to populate. Do not re-probe MCP servers yourself.
3. **Present data, don't take action.** This command is strictly read-only. Do not send emails, update tasks, or modify any files.
4. **Keep output scannable.** No walls of text. Use counts, progress bars, and short status lines.
5. **Timestamp the report.** Always include "Last checked" with the current date and time at the bottom.
6. **Include the preflight hint.** Always end with the `/orbitant-chief-of-staff:preflight` suggestion so the user knows how to fix setup issues surfaced by the dashboard.
