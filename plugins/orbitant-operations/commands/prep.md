---
name: prep
description: Meeting prep — pulls context from emails, calendar history, contacts, and tasks for upcoming meetings.
---

## Overview

Prepares briefing docs for upcoming meetings by pulling attendee context from contacts/, past emails, calendar history, and open tasks. By default it preps all meetings for today; pass a meeting name or contact name as argument to narrow scope. Each briefing gives you enough context to walk into the meeting prepared without scrambling through inboxes.

## Execution Flow

1. **Invoke `orbitant-graceful-degradation`** to check which MCP servers and config files are available. This MUST run first -- do not skip it.
2. **Pull today's calendar** via Google Calendar MCP (`mcp__calendar__list_events`). If the user specified a meeting name or contact, filter to matching events only.
3. **Identify attendees** for each meeting from the calendar event data (email addresses, display names).
4. **Load contact files** from contacts/*.md -- match attendees by email or name against contact frontmatter. Parse tier, communication style, role, company, and open commitments.
5. **Search Gmail** (`mcp__gmail__search_emails`) for the last 5 email threads with each attendee (query: `from:{email} OR to:{email}`, `max_results: 5`).
6. **Search Slack** (`mcp__claude_ai_Slack__slack_search_public`) for recent messages mentioning each attendee or their company name. Limit to 5 results per attendee.
7. **Check Asana** (`mcp__asana__asana_search_tasks`) for open tasks mentioning the attendee name, company, or meeting topic.
8. **Invoke `orbitant-goal-alignment`** on each meeting title/description against rocks.yaml to compute an alignment score.
9. **Compile briefing** for each meeting using the output format below.

## Arguments

- `/prep` -- prep all meetings for today, one briefing per meeting.
- `/prep "Acme Corp"` -- prep only meetings whose title or attendee list matches "Acme Corp".
- `/prep @jane.smith` -- prep all meetings that include jane.smith as an attendee (match against email or contact file name).

If the argument matches no meetings, print: "No meetings found matching '{argument}'. Showing all meetings for today." and fall back to full-day prep.

## Briefing Sections

Generate these sections for each meeting:

### Attendee Profiles

For each attendee, build a card from contacts/*.md and MCP data:

- **Name** -- full name from contact file or calendar event
- **Role & Company** -- from contact frontmatter (`role`, `company`)
- **Tier** -- from contact frontmatter (Tier 1 / Tier 2 / Tier 3 / Unknown)
- **Communication Style** -- from contact frontmatter (`communication_style` field), e.g., "direct, prefers data", "relationship-first"
- **Notes** -- last `notes` entry from the contact file, if present

If no contact file exists for an attendee, show name and email from the calendar event and mark as "No contact file -- showing MCP data only."

### Recent Interactions

For each attendee, pull the last 5 emails or Slack messages:

- **Source** (Gmail / Slack)
- **Date** and relative time (e.g., "3 days ago")
- **Subject or thread preview** -- first 80 characters
- **Direction** -- inbound or outbound

Sort by date descending. If no interactions are found, print: "No recent interactions found for {name}."

### Open Commitments

Surface tasks and action items tied to meeting attendees:

- **From Asana**: Open tasks where the attendee is assignee, collaborator, or mentioned in the task name/description.
- **From contacts/*.md**: Parse `commitments` or `action_items` fields from the contact file if present.
- Show each commitment as: status indicator, task title, source (Asana / contact file), due date if available.

If no commitments found, print: "No open commitments found for this meeting."

### Suggested Talking Points

Synthesize talking points from the data gathered:

- Unresolved items from recent email threads (subjects with "Re:" chains and no clear resolution)
- Overdue commitments involving any attendee
- Recent notes from contact files that mention follow-ups or open questions
- Stale contact alerts (Tier 1 contacts past their `staleness_days` threshold)

Present as a numbered list, max 5 points per meeting.

### Goal Alignment

- Run `orbitant-goal-alignment` on the meeting title and description.
- Show the alignment score, matched rock name, and relevance level (HIGH/MED/LOW).
- If no rocks.yaml is available, print: "Goal alignment unavailable -- add rocks.yaml to enable."

## Output Format

Render one briefing block per meeting:

```
# Meeting Prep -- {date}

---

## 11:00 -- Client Call: Acme Corp (45m) [HIGH 0.85 -> Revenue Acceleration]

### Attendees
- Jane Smith | VP Sales, Acme Corp | Tier 1 | Style: direct, data-driven
  Last note: "Wants revised pricing by end of month"
- Carlos Vega | Account Exec, Internal | Tier 2 | Style: collaborative
  No recent notes

### Recent Interactions
- 2d ago  | Gmail (inbound) | Jane Smith -- "Re: Contract terms for Q3"
- 5d ago  | Gmail (outbound) | Jane Smith -- "Proposal v2 attached"
- 1w ago  | Slack | @carlos.vega -- "Acme deal update in #sales"

### Open Commitments
- [ ] Send revised pricing to Jane (Asana, due: Feb 27)
- [ ] Internal alignment on discount authority (contact file)
- [x] Share case study deck (Asana, completed Feb 20)

### Talking Points
1. Revised pricing -- Jane expects it by end of month, currently unresolved
2. Carlos flagged discount authority needs internal sign-off
3. Jane is 21 days past staleness threshold (7 days) -- prioritize re-engagement

### Goal Alignment
HIGH 0.85 -- Revenue Acceleration (Rock weight: 35%)

---

## 14:00 -- 1:1 with CTO (30m) [MED 0.50 -> Platform GA]
...

---
Generated: {date} {time}
```

## Batch Mode

When prepping all meetings (no argument):

- Generate one briefing block per meeting, separated by horizontal rules.
- Order meetings chronologically.
- Print a summary header at the top: "Prepping {N} meetings for {date}."
- **`--save` flag**: When present, write the full output to `./prep-{YYYY-MM-DD}.md` in the current directory. Print the file path after saving. Without this flag, output is printed to the conversation only.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Config files**: Instead of reading contacts/*.md, rocks.yaml, or constraints.yaml from disk, check whether this data has been pasted into the conversation context. Use it if available; mark as "not checked (Cowork mode)" otherwise.
- **MCP sections**: Work identically -- the same MCP tool calls are available in Cowork.
- **Contact matching**: If contact data was provided in conversation context rather than files, parse it from there. Otherwise skip contact-based enrichment with a Cowork-specific note.
- **`--save` flag**: Not available in Cowork mode. If requested, print the briefing inline and note that file saving requires CLI mode.

## Key Rules

1. **Read-only.** Never take action -- do not send emails, update tasks, modify files, or create calendar events. This command only reads and presents information.
2. **Each meeting briefing is independent.** One attendee lookup failure does not block other meetings or sections.
3. **Graceful-degradation first.** Always invoke the skill before pulling data. Do not re-probe MCP servers yourself.
4. **If a contact has no file, show what's available.** Use calendar event data and MCP search results to build a partial profile rather than showing nothing.
5. **Always include goal-alignment.** Every meeting briefing must show an alignment score when rocks.yaml is available.
6. **Timestamp the report.** Include "Generated: {date} {time}" at the bottom.
7. **End with a suggestion.** Close with: "Run /orbitant-operations:today for the full daily briefing."
