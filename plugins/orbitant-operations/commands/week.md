---
name: week
description: Weekly planning — organises tasks from Asana against rocks, suggests a schedule based on availability.
---

## Overview

This command builds a weekly plan by pulling Asana tasks, scoring them against your rocks, and slotting them into available calendar time. The result is a Mon–Fri time-blocked schedule that maximises goal alignment while respecting energy patterns and hard stops. When you confirm the plan, it writes back to Asana to reflect the chosen priorities and due dates.

## Execution Flow

1. **Invoke `orbitant-graceful-degradation`** to check which MCP servers and config files are available. This MUST run first — do not skip it.
2. **Pull Asana tasks** assigned to the current user that are due this week or overdue, using `mcp__asana__asana_search_tasks`.
3. **Pull calendar events** for the current week (Mon–Fri) using `mcp__calendar__list_events`.
4. **Load config files**: `rocks.yaml` for goal definitions and `constraints.yaml` for energy patterns, hard stops, and work-hour boundaries.
5. **Score each task** via `orbitant-goal-alignment` against rocks.yaml. Sort results HIGH → LOW.
6. **Generate the proposed weekly plan** by slotting scored tasks into available calendar blocks following the schedule suggestion rules below.
7. **Present the plan** for user approval using the output format below.

If any data source is unavailable, use the same fallback pattern as `/orbitant-operations:today` — note the missing source inline and continue with what is available. A plan with partial data is better than no plan.

## Task Scoring

Each Asana task is scored via `orbitant-goal-alignment`:

- **Sort order**: HIGH → MED → LOW by alignment score.
- **Overdue tasks**: Flagged with a warning indicator and promoted to the top of their alignment tier. Overdue HIGH tasks are scheduled first on Monday.
- **Execution tasks**: Tasks that require a concrete deliverable (e.g., "send follow-up to Acme", "draft proposal for Board") are marked as `[EXEC]`. For these, the system should draft the deliverable during the planning session — not just schedule time for it. Ask the user if they want the draft produced now or during the scheduled block.
- **Unscored tasks**: If rocks.yaml is missing, list tasks by due date without alignment scores and append "Add rocks.yaml to enable goal-alignment scoring."

## Schedule Suggestion

Use `constraints.yaml` to determine slot placement. Defaults apply when constraints.yaml is absent.

- **Morning blocks** (default 09:00–12:00): Reserve for HIGH-alignment deep work and `[EXEC]` tasks. These are peak-energy hours.
- **Midday blocks** (default 12:00–14:00): Meetings, syncs, and collaborative work.
- **Afternoon blocks** (default 14:00–18:00): MED-alignment tasks, admin, LOW-alignment items, and catch-up.
- **Hard stops**: Read from constraints.yaml (e.g., school pickup at 16:30). Never schedule past a hard stop. Add buffer time before hard stops per `buffer_between` setting.
- **Over-scheduled days**: If scheduled task time plus meeting time exceeds available work hours for any day, flag it: "Wednesday is over-scheduled by 1.5h — consider moving [task] to Thursday."
- **Focus time**: Show available focus time per day after all tasks and meetings are placed. Aim for a minimum of 1h unscheduled buffer per day.

## Pushback

When low-leverage tasks accumulate, surface a single pushback message per invocation:

> "Based on your rocks, {N} of {total} tasks this week are LOW alignment. Consider deferring or delegating: {list of LOW tasks}."

Trigger this when LOW-alignment tasks exceed 30% of the total. Keep the tone direct — this is a strategic observation, not a suggestion to ignore work. Present it once at the end of the scoring summary, before the schedule.

## Confirmation Flow

The weekly plan is a proposal, not an action.

1. **Present the full plan** using the output format below.
2. **User options**: Approve, modify (move tasks between days, remove items, add items), or reject.
3. **On modification**: Re-render the affected days and re-check for over-scheduling.
4. **On approval**: Update Asana tasks to reflect the plan — adjust priorities and due dates. Confirm each write operation with the user before executing. Group updates by day for efficiency (e.g., "Update 3 tasks for Monday — proceed?").
5. **On rejection**: Discard the plan. No Asana writes.

## Output Format

Render the weekly plan using this structure:

```
# Weekly Plan — Mon 24 Feb to Fri 28 Feb 2026

## Scoring Summary
Tasks scored: 12 | HIGH: 4 | MED: 5 | LOW: 3
Overdue: 1 (flagged below)
Pushback: 3 of 12 tasks are LOW alignment — consider deferring or delegating:
  - Clean up Jira backlog [LOW 0.12]
  - Update team wiki formatting [LOW 0.18]
  - Archive old Slack channels [LOW 0.10]

## Monday 24 Feb
09:00–10:30  [HIGH 0.92] Finalize Acme proposal [EXEC] — Revenue Acceleration
10:30–11:00  Buffer
11:00–11:45  Team standup (meeting)
13:00–14:00  [HIGH 0.80] Review beta feedback — Platform GA
14:00–15:00  [MED  0.50] Prep board deck section 3
15:00–16:00  [MED  0.40] Vendor evaluation calls
Focus time: 1.5h available

## Tuesday 25 Feb
09:00–10:30  [HIGH 0.88] Draft investor update [EXEC] — Fundraising
11:00–12:00  Client call: Acme Corp (meeting)
13:00–14:00  1:1 with CTO (meeting)
14:00–15:30  [MED  0.55] Sprint planning prep
16:00–16:30  [LOW  0.18] Update team wiki formatting
Focus time: 1h available

...

## Deferred / Delegated
- Archive old Slack channels [LOW 0.10] — no slot this week
- Clean up Jira backlog [LOW 0.12] — suggest delegate to ops

---
Generated: 2026-02-25 08:30
Approve this plan? (approve / modify / reject)
```

Keep the output scannable. No paragraphs of prose — use short lines, scores, and time blocks.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Config files**: Check whether rocks.yaml, constraints.yaml, or task data has been pasted into the conversation context. Use it if available; mark as "not checked (Cowork mode)" otherwise.
- **MCP sections**: Work identically — the same MCP tool calls are available in Cowork.

## Key Rules

1. **Read Asana before proposing.** Never generate a plan from assumptions — always pull live task data first.
2. **Never update Asana without confirmation.** Every write requires explicit user approval. Group updates by day for efficiency.
3. **Each day is independent.** Modifying Wednesday does not re-render Monday. Only affected days are re-checked.
4. **Goal-alignment scores inline.** Show alignment level and numeric score next to every task.
5. **Respect constraints.** Hard stops, energy patterns, and buffer times from constraints.yaml are non-negotiable scheduling rules.
6. **Graceful-degradation first.** Always invoke the skill before pulling data. Do not probe MCP servers directly.
7. **One pushback per run.** Surface the low-leverage observation once. Do not repeat it after modifications.
8. **Timestamp the report.** Include "Generated: {date} {time}" at the bottom.
9. **End with confirmation prompt.** Always close with the approve/modify/reject options.
