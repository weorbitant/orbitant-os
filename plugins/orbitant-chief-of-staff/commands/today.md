---
name: today
description: Morning briefing — calendar, tasks, urgent messages, strategic signals. Flags --calendar-only, --tasks-only, --messages-only.
---

## Overview

This is the single command to start your day. It consolidates calendar events, goal-aligned task priorities, urgent messages from known contacts, and strategic signals into one briefing. Run it before opening your inbox so you begin with clarity rather than reactivity.

## Execution Flow

1. **Invoke `orbitant-graceful-degradation`** to check which MCP servers and config files are available. This MUST run first -- do not skip it, even if you believe everything is connected.
2. **Check for sub-command flags** (`--calendar-only`, `--tasks-only`, `--messages-only`). If a flag is present, build only that section. If no flags are present, build the full briefing with all four sections.
3. **Build each section independently** using the availability report. If a data source is missing, print the fallback message for that section and continue. One failing source never blocks the rest.
4. **Present the consolidated briefing** using the output format below.

## Sub-Command Flags

Support partial runs when the user only needs one slice:

- `--calendar-only` -- render only the Calendar Overview section
- `--tasks-only` -- render only the Task Priorities section
- `--messages-only` -- render only the Urgent Messages section
- No flags -- full briefing (all four sections: Calendar, Tasks, Messages, Signals)

When a flag is active, still run graceful-degradation first, but skip sections not requested. If the required MCP for the flagged section is unavailable, print the fallback and exit.

## Dashboard Sections

Build each section in order. Use the availability report from graceful-degradation to decide which sections populate with live data and which show fallback messages.

### 1. Calendar Overview

**Requires**: Google Calendar MCP (`mcp__calendar__list_events`), constraints.yaml (optional)

Pull today's events and present them chronologically:

- **List each meeting** with start time, title, duration, and goal-alignment score (invoke `orbitant-goal-alignment` on meeting titles/descriptions when rocks.yaml is available).
- **Flag hard stop conflicts**: Compare each meeting's end time (plus `buffer_between` minutes from constraints.yaml) against `hard_stops`. Warn if any meeting runs into or overlaps a hard stop.
- **Over-scheduled warning**: If meeting count exceeds `max_per_day` from constraints.yaml (default: 5), print a warning line.
- **Focus time**: Calculate total non-meeting time during work hours (from constraints.yaml, default 09:00-18:00). List available focus blocks.
- **Energy alignment**: If constraints.yaml defines `energy_pattern` (e.g., deep work mornings), flag meetings that conflict with energy preferences (e.g., a low-priority sync during peak deep-work hours).

**Fallback** (Calendar unavailable): Print "Calendar data unavailable -- connect Google Calendar MCP."

### 2. Task Priorities

**Requires**: Asana MCP (`mcp__asana__asana_search_tasks`), rocks.yaml (optional)

Pull tasks due today assigned to the current user:

- **Overdue tasks first**: Any task past its due date goes to the top, flagged with a warning indicator.
- **Score each task** via `orbitant-goal-alignment` against rocks.yaml. Show the alignment level (HIGH/MED/LOW) and numeric score.
- **Sort by alignment score** descending -- HIGH items first, then MED, then LOW.
- **Show linked rock name** next to high-alignment tasks so the user sees which goal each task serves.
- Tasks with no alignment match show as LOW with no rock label.

**Fallback** (Asana unavailable): Print "Task data unavailable -- connect Asana MCP."
**Fallback** (rocks.yaml missing): List tasks without alignment scores; append "Add rocks.yaml to enable goal-alignment scoring."

### 3. Urgent Messages

**Requires**: Gmail MCP (`mcp__gmail__search_emails`) and/or Slack MCP (`mcp__claude_ai_Slack__slack_read_channel`), contacts/*.md (optional)

Scan unread emails and Slack threads for urgent items:

- **Contact filtering**: If contacts/*.md files exist, filter messages to only show senders matching Tier 1 and Tier 2 contacts. Parse contact frontmatter to match email addresses and Slack handles.
- **No contacts configured**: Show all unread messages, but print a warning: "Contact files not configured -- showing all unread. Create contacts/*.md to filter by tier."
- **For each message**: Show sender, subject or thread preview, channel (Gmail/Slack), time ago, and tier badge.
- **Sort**: Tier 1 first (red indicator), then Tier 2 (yellow indicator), then by recency within each tier.
- **Limit**: Show top 10 messages maximum to keep the briefing scannable.

**Fallback** (neither Gmail nor Slack available): Print "Message data unavailable -- connect Gmail or Slack MCP."
**Fallback** (only one available): Show data from the available source, note which is missing.

### 4. Strategic Signals

**Requires**: rocks.yaml, contacts/*.md (optional), Calendar data from section 1 (optional)

Synthesize cross-cutting signals that surface drift or risk:

- **Goal progress summary**: For each rock in rocks.yaml, compute average progress across key results. Render a 10-segment progress bar (`■` filled, `□` empty) with percentage and status.
- **Stale contact alerts**: Scan contacts/*.md for Tier 1 contacts where `today - last_interaction > staleness_days`. List each with name, days since contact, and threshold.
- **Calendar drift warning**: Compare today's meeting distribution against rock weights. If a rock with significant weight (>20%) has zero meetings allocated to it today, flag the drift. This is a soft signal, not a hard rule -- present it as an observation.
- **At-risk goals**: If any rock has status `at_risk` or `off_track`, surface it prominently.

**Fallback** (rocks.yaml missing): Print "Strategic signals disabled -- create rocks.yaml to enable."

## Output Format

Render the briefing using this structure. Use "Good morning" before 12:00, "Good afternoon" from 12:00-17:00, "Good evening" after 17:00 based on local time or constraints.yaml timezone.

```
# Good morning -- here's your briefing

## Calendar (Today)
- 09:30 -- Team standup (30m)
- 11:00 -- Client call: Acme Corp (45m) [HIGH 0.85]
- 14:00 -- 1:1 with CTO (30m)
- 16:00 -- Sprint review (60m)
Focus time: 2.5h available (09:00-09:30, 12:00-14:00)
Warning: Sprint review runs into "School pickup" hard stop buffer

## Tasks (Due Today)
[HIGH 0.90] Finalize Acme proposal -- Revenue Acceleration
[HIGH 0.75] Review beta feedback report -- Platform GA
[MED  0.45] Update team wiki -- Team & Culture
[LOW  0.15] Clean up Jira backlog

## Urgent Messages
Tier 1 | jane.smith@acmecorp.io -- "Re: Contract terms" (Gmail, 2h ago)
Tier 2 | @carlos.vega -- "Deployment issue in staging" (Slack, 45m ago)

## Strategic Signals
[■■■■■■■□□□] Revenue Acceleration (37%) -- on track
Warning: Jane Smith (Tier 1) -- 21 days since last contact (threshold: 7)
Warning: Calendar drift -- Platform GA (30% weight) has 0% of today's meetings

---
Run /orbitant-chief-of-staff:triage to process your inbox
```

Keep the output scannable. No paragraphs of prose -- use short lines, counts, indicators, and scores.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Config files**: Instead of reading rocks.yaml, constraints.yaml, or contacts from disk, check whether this data has been pasted into the conversation context. Use it if available; mark as "not checked (Cowork mode)" otherwise.
- **MCP sections**: Work identically -- the same MCP tool calls are available in Cowork.
- **Contact filtering**: If contact data was provided in conversation context rather than files, parse it from there. Otherwise skip contact-based filtering with a Cowork-specific note.

## Key Rules

1. **Read-only.** Never take action -- do not send emails, update tasks, modify files, or create calendar events. This command only presents information.
2. **Each section is independent.** One failing source does not block others. Always render every requested section.
3. **Graceful-degradation first.** Always invoke the skill before building sections. Do not re-probe MCP servers yourself.
4. **Goal-alignment inline.** Show alignment scores next to tasks and meetings so the user sees strategic relevance at a glance.
5. **Greet naturally.** Use time-appropriate greeting based on local time or constraints.yaml timezone.
6. **End with /triage.** Always close with a suggestion to run `/orbitant-chief-of-staff:triage` to process the inbox.
7. **Timestamp the report.** Include "Generated: {date} {time}" at the bottom, before the /triage suggestion.
